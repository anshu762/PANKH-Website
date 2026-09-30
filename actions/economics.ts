"use server";

import { auth } from "@/auth";
import { economicsService } from "@/services/economics.service";
import {
  CreateTransactionInput,
  createTransactionSchema,
  UpdateTransactionInput,
  updateTransactionSchema,
  deleteTransactionSchema,
} from "@/schemas/economics";
import { revalidatePath } from "next/cache";

export async function getEconomicsDashboardData(
  batchId?: string,
  assumedValuePerBird: number = 135
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const data = await economicsService.getBatchEconomicsDashboardData(
      session.user.id,
      batchId,
      assumedValuePerBird
    );
    return { success: true, data };
  } catch (error: any) {
    console.error("Error in getEconomicsDashboardData action:", error);
    return { error: error.message || "Failed to load economics dashboard data" };
  }
}

export async function getFarmerBatchesForSelect() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const batches = await economicsService.getFarmerBatches(session.user.id);
    return { success: true, batches };
  } catch (error: any) {
    console.error("Error fetching batches:", error);
    return { error: error.message || "Failed to load batches" };
  }
}

export async function createTransactionAction(data: CreateTransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const validated = createTransactionSchema.parse(data);
    const transaction = await economicsService.createTransaction(
      session.user.id,
      validated
    );

    revalidatePath("/dashboard/economics");
    revalidatePath("/dashboard");

    return { success: true, transaction };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    return { error: error.message || "Failed to save transaction record" };
  }
}

export async function updateTransactionAction(data: UpdateTransactionInput) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const validated = updateTransactionSchema.parse(data);
    const transaction = await economicsService.updateTransaction(
      session.user.id,
      validated
    );

    revalidatePath("/dashboard/economics");
    revalidatePath("/dashboard");

    return { success: true, transaction };
  } catch (error: any) {
    console.error("Error updating transaction:", error);
    return { error: error.message || "Failed to update transaction" };
  }
}

export async function deleteTransactionAction(transactionId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  try {
    const validated = deleteTransactionSchema.parse({ id: transactionId });
    await economicsService.deleteTransaction(session.user.id, validated.id);

    revalidatePath("/dashboard/economics");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    return { error: error.message || "Failed to delete transaction" };
  }
}
