/**
 * Pankh Farm Economics — Service Layer
 * 
 * Orchestrates data access, Prisma operations, deterministic calculation engine,
 * and rule-based insights for the Farm Economics module.
 */

import { prisma } from "@/lib/db";
import {
  CreateTransactionInput,
  UpdateTransactionInput,
} from "@/schemas/economics";
import {
  BatchComparisonItem,
  BatchEconomicsReport,
  BatchOption,
  EconomicsDashboardData,
  TransactionRecord,
} from "@/types/economics";
import {
  buildBatchEconomicsReport,
  normalizeAmount,
} from "@/lib/economics/calculations";
import { generateDeterministicInsights } from "@/lib/economics/insights";

export class EconomicsService {
  /**
   * Retrieves all batches for a farmer's farm (for batch switcher / selection).
   */
  async getFarmerBatches(userId: string): Promise<BatchOption[]> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        farms: {
          include: {
            batches: {
              orderBy: [{ status: "asc" }, { createdAt: "desc" }],
            },
          },
        },
      },
    });

    if (!farmer || farmer.farms.length === 0) {
      return [];
    }

    const batches: BatchOption[] = [];
    for (const farm of farmer.farms) {
      for (const b of farm.batches) {
        batches.push({
          id: b.id,
          name: `${farm.name} - ${b.birdType} (${b.status})`,
          birdType: b.birdType,
          breed: b.breed,
          startingBirds: b.startingBirds,
          status: b.status,
          placementDate: b.placementDate.toISOString().slice(0, 10),
        });
      }
    }

    return batches;
  }

  /**
   * Retrieves the comprehensive economics dashboard data for a given batch.
   * If batchId is omitted, defaults to the farmer's currently ACTIVE batch.
   */
  async getBatchEconomicsDashboardData(
    userId: string,
    batchId?: string,
    assumedValuePerBird: number = 135
  ): Promise<EconomicsDashboardData> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        farms: {
          include: {
            batches: {
              orderBy: [{ status: "asc" }, { createdAt: "desc" }],
            },
          },
        },
      },
    });

    if (!farmer || farmer.farms.length === 0) {
      return {
        report: null,
        insights: [],
        comparison: null,
        batches: [],
        activeBatchId: null,
      };
    }

    const allBatches: BatchOption[] = [];
    let selectedBatchEntity: any = null;
    let previousClosedBatchEntity: any = null;

    for (const farm of farmer.farms) {
      for (const b of farm.batches) {
        allBatches.push({
          id: b.id,
          name: `${farm.name} - ${b.birdType} (${b.status})`,
          birdType: b.birdType,
          breed: b.breed,
          startingBirds: b.startingBirds,
          status: b.status,
          placementDate: b.placementDate.toISOString().slice(0, 10),
        });

        if (batchId && b.id === batchId) {
          selectedBatchEntity = b;
        } else if (!batchId && !selectedBatchEntity && b.status === "ACTIVE") {
          selectedBatchEntity = b;
        }
      }
    }

    // Fallback to first batch if neither active nor requested ID found
    if (!selectedBatchEntity && farmer.farms[0]?.batches[0]) {
      selectedBatchEntity = farmer.farms[0].batches[0];
    }

    if (!selectedBatchEntity) {
      return {
        report: null,
        insights: [],
        comparison: null,
        batches: allBatches,
        activeBatchId: null,
      };
    }

    // Find the most recent CLOSED batch (different from selectedBatchEntity) for comparative benchmarking
    for (const farm of farmer.farms) {
      const closed = farm.batches.find(
        (b) => b.status === "CLOSED" && b.id !== selectedBatchEntity.id
      );
      if (closed) {
        previousClosedBatchEntity = closed;
        break;
      }
    }

    // Fetch transactions and daily health logs for selected batch
    const transactions = await prisma.transaction.findMany({
      where: { batchId: selectedBatchEntity.id },
      orderBy: { date: "asc" },
    });

    const dailyLogs = await prisma.dailyHealthLog.findMany({
      where: { batchId: selectedBatchEntity.id },
      orderBy: { date: "asc" },
    });

    // Build deterministic report for selected batch
    const report = buildBatchEconomicsReport(
      selectedBatchEntity,
      transactions,
      dailyLogs,
      { assumedValuePerBird }
    );

    // Build comparative report if previous closed batch exists
    let previousReport: BatchEconomicsReport | null = null;
    let comparison: BatchComparisonItem | null = null;

    if (previousClosedBatchEntity) {
      const prevTransactions = await prisma.transaction.findMany({
        where: { batchId: previousClosedBatchEntity.id },
        orderBy: { date: "asc" },
      });
      const prevDailyLogs = await prisma.dailyHealthLog.findMany({
        where: { batchId: previousClosedBatchEntity.id },
        orderBy: { date: "asc" },
      });

      previousReport = buildBatchEconomicsReport(
        previousClosedBatchEntity,
        prevTransactions,
        prevDailyLogs,
        { assumedValuePerBird }
      );

      const curCost = report.totalBatchCost.value ?? 0;
      const prevCost = previousReport.totalBatchCost.value ?? 0;
      const curCPB = report.costPerBirdPlaced.value ?? 0;
      const prevCPB = previousReport.costPerBirdPlaced.value ?? 0;
      const curCSB = report.costPerSurvivingBird.value ?? 0;
      const prevCSB = previousReport.costPerSurvivingBird.value ?? 0;
      const curMort = report.mortalityRate.value ?? 0;
      const prevMort = previousReport.mortalityRate.value ?? 0;
      const curFeed = report.feedCostShare.value ?? 0;
      const prevFeed = previousReport.feedCostShare.value ?? 0;
      const curMargin = report.grossMargin.value ?? 0;
      const prevMargin = previousReport.grossMargin.value ?? 0;
      const curRev = report.revenue.value ?? 0;
      const prevRev = previousReport.revenue.value ?? 0;

      comparison = {
        currentBatch: report,
        previousBatch: previousReport,
        deltas: {
          totalCostDiff: Math.round((curCost - prevCost) * 100) / 100,
          costPerBirdPlacedDiff: Math.round((curCPB - prevCPB) * 100) / 100,
          costPerSurvivingBirdDiff: Math.round((curCSB - prevCSB) * 100) / 100,
          mortalityRateDiff: Math.round((curMort - prevMort) * 10) / 10,
          feedCostShareDiff: Math.round((curFeed - prevFeed) * 10) / 10,
          grossMarginDiff: Math.round((curMargin - prevMargin) * 100) / 100,
          revenueDiff: Math.round((curRev - prevRev) * 100) / 100,
        },
      };
    }

    // Generate rule-based insights
    const insights = generateDeterministicInsights(report, previousReport);

    return {
      report,
      insights,
      comparison,
      batches: allBatches,
      activeBatchId: selectedBatchEntity.id,
    };
  }

  /**
   * Records a new transaction (Expense or Revenue) for a batch.
   */
  async createTransaction(
    userId: string,
    input: CreateTransactionInput
  ): Promise<TransactionRecord> {
    // 1. Verify batch belongs to farmer
    const batch = await prisma.batch.findUnique({
      where: { id: input.batchId },
      include: {
        farm: {
          include: { farmer: true },
        },
      },
    });

    if (!batch || batch.farm.farmer.userId !== userId) {
      throw new Error("Unauthorized: You do not own this flock batch");
    }

    const txDate = typeof input.date === "string" ? new Date(input.date) : input.date;

    const transaction = await prisma.transaction.create({
      data: {
        batchId: input.batchId,
        type: input.type,
        category: input.category,
        amount: input.amount,
        quantity: input.quantity ?? null,
        unit: input.unit ?? null,
        note: input.note ?? null,
        date: txDate,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "CREATE_TRANSACTION",
        entityType: "TRANSACTION",
        entityId: transaction.id,
        metadata: {
          batchId: input.batchId,
          type: input.type,
          category: input.category,
          amount: input.amount,
        },
      },
    });

    return {
      id: transaction.id,
      batchId: transaction.batchId,
      type: transaction.type,
      category: transaction.category,
      amount: normalizeAmount(transaction.amount),
      quantity: transaction.quantity,
      unit: transaction.unit,
      note: transaction.note,
      date: transaction.date,
      createdAt: transaction.createdAt,
    };
  }

  /**
   * Updates an existing transaction.
   */
  async updateTransaction(
    userId: string,
    input: UpdateTransactionInput
  ): Promise<TransactionRecord> {
    const existing = await prisma.transaction.findUnique({
      where: { id: input.id },
      include: {
        batch: {
          include: {
            farm: {
              include: { farmer: true },
            },
          },
        },
      },
    });

    if (!existing || existing.batch.farm.farmer.userId !== userId) {
      throw new Error("Unauthorized: Transaction not found or unauthorized");
    }

    const updated = await prisma.transaction.update({
      where: { id: input.id },
      data: {
        ...(input.amount !== undefined && { amount: input.amount }),
        ...(input.category !== undefined && { category: input.category }),
        ...(input.quantity !== undefined && { quantity: input.quantity }),
        ...(input.unit !== undefined && { unit: input.unit }),
        ...(input.date !== undefined && {
          date: typeof input.date === "string" ? new Date(input.date) : input.date,
        }),
        ...(input.note !== undefined && { note: input.note }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "UPDATE_TRANSACTION",
        entityType: "TRANSACTION",
        entityId: updated.id,
        metadata: {
          previousAmount: normalizeAmount(existing.amount),
          newAmount: input.amount ?? normalizeAmount(existing.amount),
        },
      },
    });

    return {
      id: updated.id,
      batchId: updated.batchId,
      type: updated.type,
      category: updated.category,
      amount: normalizeAmount(updated.amount),
      quantity: updated.quantity,
      unit: updated.unit,
      note: updated.note,
      date: updated.date,
      createdAt: updated.createdAt,
    };
  }

  /**
   * Deletes a transaction.
   */
  async deleteTransaction(userId: string, transactionId: string): Promise<boolean> {
    const existing = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        batch: {
          include: {
            farm: {
              include: { farmer: true },
            },
          },
        },
      },
    });

    if (!existing || existing.batch.farm.farmer.userId !== userId) {
      throw new Error("Unauthorized: Transaction not found or access denied");
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    });

    await prisma.auditLog.create({
      data: {
        actorId: userId,
        action: "DELETE_TRANSACTION",
        entityType: "TRANSACTION",
        entityId: transactionId,
        metadata: {
          amount: normalizeAmount(existing.amount),
          type: existing.type,
          category: existing.category,
        },
      },
    });

    return true;
  }
}

export const economicsService = new EconomicsService();
