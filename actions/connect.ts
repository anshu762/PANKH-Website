"use server";

import { auth } from "@/auth";
import { connectService } from "@/services/connect.service";
import {
  createFarmerCaseSchema,
  sendCaseSummarySchema,
  updateCaseStatusSchema,
  CreateFarmerCaseInput,
  SendCaseSummaryInputSchema,
  UpdateCaseStatusInput,
} from "@/schemas/connect";
import { revalidatePath } from "next/cache";

export async function getConnectInitialData() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const context = await connectService.getFarmerConnectContext(session.user.id);
    if (!context) {
      return { needsOnboarding: true };
    }

    const cases = await connectService.getFarmerCases(context.farmer.id);
    const originCoords = context.farm.latitude && context.farm.longitude
      ? { latitude: context.farm.latitude, longitude: context.farm.longitude }
      : undefined;

    const nearbyVets = await connectService.matchVets({
      originCoords,
      limit: 10,
    });

    return {
      success: true,
      context: {
        farmer: {
          id: context.farmer.id,
          name: context.farmer.user?.name || "",
          village: context.farmer.village,
          district: context.farmer.district,
          state: context.farmer.state,
        },
        farm: {
          id: context.farm.id,
          name: context.farm.name,
          latitude: context.farm.latitude,
          longitude: context.farm.longitude,
        },
        batch: context.batch
          ? {
              id: context.batch.id,
              name: context.batch.breed,
              breed: context.batch.breed,
              currentBirds: context.batch.currentBirds,
              startingBirds: context.batch.startingBirds,
              productionType: context.batch.productionType,
              placementDate: context.batch.placementDate.toISOString(),
            }
          : null,
      },
      cases,
      nearbyVets,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to load Connect data";
    console.error("Error in getConnectInitialData action:", error);
    return { error: errorMsg };
  }
}

export async function getCaseDetailAction(caseId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const caseRecord = await connectService.getCaseById(caseId);
    if (!caseRecord) {
      return { error: "Case not found" };
    }

    let summaryPayload;
    try {
      summaryPayload = await connectService.generateSummaryForCase(caseId);
    } catch (e) {
      console.warn("Could not generate live summary payload:", e);
    }

    const nearbyVets = await connectService.matchVets({
      caseId,
      limit: 5,
    });

    return {
      success: true,
      caseRecord,
      summaryPayload,
      nearbyVets,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch case detail";
    console.error("Error in getCaseDetailAction:", error);
    return { error: errorMsg };
  }
}

export async function createFarmerCaseAction(input: CreateFarmerCaseInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parseResult = createFarmerCaseSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.errors[0]?.message || "Validation failed" };
  }

  try {
    const context = await connectService.getFarmerConnectContext(session.user.id);
    if (!context) {
      return { error: "Farmer profile not found" };
    }

    const caseRecord = await connectService.createFarmerCase(
      parseResult.data,
      context.farmer.id,
      session.user.id
    );

    revalidatePath("/dashboard/connect");
    return { success: true, caseRecord };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to create case";
    console.error("Error creating farmer case:", error);
    return { error: errorMsg };
  }
}

export async function sendCaseSummaryAction(input: SendCaseSummaryInputSchema) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parseResult = sendCaseSummarySchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.errors[0]?.message || "Validation failed" };
  }

  try {
    const { result, caseRecord } = await connectService.sendCaseSummaryToVet({
      caseId: parseResult.data.caseId,
      vetLabId: parseResult.data.vetLabId,
      consentGiven: parseResult.data.consentGiven,
      channel: parseResult.data.preferredChannel,
      actorUserId: session.user.id,
    });

    revalidatePath("/dashboard/connect");
    revalidatePath(`/dashboard/connect/${parseResult.data.caseId}`);

    return { success: true, result, caseRecord };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send case summary";
    console.error("Error sending case summary:", error);
    return { error: errorMsg };
  }
}

export async function updateCaseStatusAction(input: UpdateCaseStatusInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const parseResult = updateCaseStatusSchema.safeParse(input);
  if (!parseResult.success) {
    return { error: parseResult.error.errors[0]?.message || "Validation failed" };
  }

  try {
    const updated = await connectService.updateCaseStatus({
      caseId: parseResult.data.caseId,
      status: parseResult.data.status,
      actorUserId: session.user.id,
      notes: parseResult.data.notes,
    });

    revalidatePath("/dashboard/connect");
    revalidatePath(`/dashboard/connect/${parseResult.data.caseId}`);

    return { success: true, caseRecord: updated };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Failed to update case status";
    console.error("Error updating case status:", error);
    return { error: errorMsg };
  }
}
