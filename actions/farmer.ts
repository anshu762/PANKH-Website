"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { buildBatchEconomicsReport } from "@/lib/economics/calculations";
import { weatherService } from "@/services/weather.service";

export async function getFarmerDashboardData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            preferredLanguage: true,
          },
        },
        farms: {
          include: {
            batches: {
              where: { status: "ACTIVE" },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!farmer || farmer.farms.length === 0) {
      return { needsOnboarding: true, farmer };
    }

    const activeFarm = farmer.farms[0];
    const activeBatch = activeFarm.batches[0] || null;

    let todayLog = null;
    let latestAlert = null;
    let totalSpend = 0;
    let totalRevenue = 0;

    if (activeBatch) {
      // Check for today's log (India date standard)
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      todayLog = await prisma.dailyHealthLog.findFirst({
        where: {
          batchId: activeBatch.id,
          OR: [
            { createdAt: { gte: startOfDay } },
            { date: { gte: startOfDay } },
          ],
        },
        orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      });

      // Fetch latest sentinel alerts
      latestAlert = await prisma.alert.findFirst({
        where: { batchId: activeBatch.id },
        orderBy: { createdAt: "desc" },
      });

      const recentAlerts = await prisma.alert.findMany({
        where: { batchId: activeBatch.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      });

      const recentLogs = await prisma.dailyHealthLog.findMany({
        where: { batchId: activeBatch.id },
        orderBy: { createdAt: "desc" },
        take: 5,
      });

      // Fetch transactions and compute deterministic batch economics
      const transactions = await prisma.transaction.findMany({
        where: { batchId: activeBatch.id },
      });

      const report = buildBatchEconomicsReport(
        activeBatch,
        transactions,
        recentLogs
      );

      // Calculate flock cycle
      let flockDay = 1;
      if (activeBatch.placementDate) {
        const placed = new Date(activeBatch.placementDate);
        const now = new Date();
        const diffDays = Math.floor(
          (now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24)
        );
        flockDay = Math.max(1, diffDays + 1);
      }

      const livability =
        activeBatch.startingBirds > 0
          ? Number(
              ((activeBatch.currentBirds / activeBatch.startingBirds) * 100).toFixed(1)
            )
          : 100.0;

      return {
        success: true,
        needsOnboarding: false,
        farmer,
        farm: activeFarm,
        batch: activeBatch,
        todayLog,
        latestAlert,
        recentAlerts,
        recentLogs,
        flockCycle: {
          day: flockDay,
          targetDays: activeBatch.productionType === "BROILER" ? 42 : 72,
          livability,
          progressPercent: Math.min(
            100,
            Math.round((flockDay / (activeBatch.productionType === "BROILER" ? 42 : 72)) * 100)
          ),
        },
        weather: await weatherService.getWeatherForFarm(
          activeFarm.latitude,
          activeFarm.longitude,
          farmer.district
        ),
        economics: {
          totalSpend: report.totalBatchCost.value ?? 0,
          totalRevenue: report.revenue.value ?? 0,
          netMargin: report.grossMargin.value ?? 0,
          estimatedCostPerBird: report.costPerSurvivingBird.value ?? 0,
          costPerBirdPlaced: report.costPerBirdPlaced.value ?? 0,
          feedCostShare: report.feedCostShare.value ?? 0,
          isEstimated: report.costPerSurvivingBird.isEstimated,
          assumptions: report.costPerSurvivingBird.assumptions,
        },
      };
    }

    return {
      success: true,
      needsOnboarding: false,
      farmer,
      farm: activeFarm,
      batch: null,
      todayLog: null,
      latestAlert: null,
      recentAlerts: [],
      recentLogs: [],
      flockCycle: null,
      weather: await weatherService.getWeatherForFarm(
        activeFarm?.latitude,
        activeFarm?.longitude,
        farmer.district
      ),
      economics: {
        totalSpend: 0,
        totalRevenue: 0,
        netMargin: 0,
        estimatedCostPerBird: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching farmer dashboard data:", error);
    return { error: "Failed to load dashboard data." };
  }
}

export async function updateFarmerProfile(data: {
  name?: string;
  phone?: string;
  village?: string;
  district?: string;
  state?: string;
  preferredLanguage?: "PUNJABI" | "HINDI" | "ENGLISH";
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (data.name !== undefined || data.phone !== undefined || data.preferredLanguage !== undefined) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            ...(data.name && { name: data.name }),
            ...(data.phone !== undefined && { phone: data.phone }),
            ...(data.preferredLanguage && { preferredLanguage: data.preferredLanguage }),
          },
        });
      }

      if (data.village || data.district || data.state) {
        await tx.farmer.update({
          where: { userId: session.user.id },
          data: {
            ...(data.village && { village: data.village }),
            ...(data.district && { district: data.district }),
            ...(data.state && { state: data.state }),
          },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Failed to update profile." };
  }
}
