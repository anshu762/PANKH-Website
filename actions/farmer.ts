"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
          createdAt: { gte: startOfDay },
        },
        orderBy: { createdAt: "desc" },
      });

      // Fetch latest sentinel alert
      latestAlert = await prisma.alert.findFirst({
        where: { batchId: activeBatch.id },
        orderBy: { createdAt: "desc" },
      });

      // Sum transactions
      const transactions = await prisma.transaction.findMany({
        where: { batchId: activeBatch.id },
        select: { type: true, amount: true },
      });

      for (const tx of transactions) {
        const num = Number(tx.amount);
        if (tx.type === "EXPENSE") totalSpend += num;
        if (tx.type === "REVENUE") totalRevenue += num;
      }
    }

    return {
      success: true,
      needsOnboarding: false,
      farmer,
      farm: activeFarm,
      batch: activeBatch,
      todayLog,
      latestAlert,
      economics: {
        totalSpend,
        totalRevenue,
        netMargin: totalRevenue - totalSpend,
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
  preferredLanguage?: "PUNJABI" | "HINGLISH" | "HINDI" | "ENGLISH";
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
