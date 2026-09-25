"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { onboardingSchema, OnboardingInput } from "@/schemas/onboarding";

export async function completeFarmOnboarding(data: OnboardingInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to complete onboarding." };
  }

  const validated = onboardingSchema.safeParse(data);
  if (!validated.success) {
    const errorDetails = validated.error.errors.map((e) => e.message).join(", ");
    return { error: `Invalid input: ${errorDetails}` };
  }

  const {
    farmName,
    location,
    latitude,
    longitude,
    farmType,
    capacity,
    shedCount,
    ventilationType,
    birdType,
    breed,
    productionType,
    placementDate,
    startingBirds,
  } = validated.data;

  try {
    // Locate or initialize the Farmer profile for this user
    let farmer = await prisma.farmer.findUnique({
      where: { userId: session.user.id },
    });

    if (!farmer) {
      farmer = await prisma.farmer.create({
        data: {
          userId: session.user.id,
          village: location || "Village",
          district: "District",
          state: "Punjab",
        },
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Farm record
      const farm = await tx.farm.create({
        data: {
          farmerId: farmer.id,
          name: farmName,
          latitude: latitude ?? null,
          longitude: longitude ?? null,
          farmType,
          capacity,
          shedCount,
          ventilationType,
        },
      });

      // 2. Create Initial Active Batch
      const batch = await tx.batch.create({
        data: {
          farmId: farm.id,
          birdType,
          breed,
          productionType,
          placementDate: new Date(placementDate),
          startingBirds,
          currentBirds: startingBirds,
          status: "ACTIVE",
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          actorId: session.user.id,
          action: "ONBOARDING_COMPLETED",
          entityType: "FARM",
          entityId: farm.id,
          metadata: {
            farmName,
            birdType,
            breed,
            productionType,
            startingBirds,
          },
        },
      });

      return { farm, batch };
    });

    return {
      success: true,
      farmId: result.farm.id,
      batchId: result.batch.id,
    };
  } catch (error) {
    console.error("Failed to complete farm onboarding:", error);
    return { error: "Failed to save farm details. Please try again." };
  }
}
