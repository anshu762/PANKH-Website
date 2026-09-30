import { prisma } from "@/lib/db";
import { AlertSeverity, CaseStatus } from "@prisma/client";
import {
  SentinelCheckinInput,
  SentinelDashboardData,
  FarmerActionType,
  RiskAssessment,
} from "@/types/sentinel";
import { calculateBatchBaseline } from "@/lib/sentinel/baseline";
import { calculateRisk } from "@/lib/sentinel/riskEngine";
import { getAlertRulesMap } from "@/lib/sentinel/rules";

export class SentinelService {
  /**
   * Retrieves active farm and batch context for authenticated farmer.
   */
  async getFarmerActiveBatch(userId: string) {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
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
      return null;
    }

    const farm = farmer.farms[0];
    const batch = farm.batches[0] || null;

    return { farmer, farm, batch };
  }

  /**
   * Retrieves comprehensive Sentinel dashboard state:
   * today's check-in, latest alert, rolling baseline, and past activity timeline.
   */
  async getSentinelDashboardData(userId: string): Promise<SentinelDashboardData | null> {
    const context = await this.getFarmerActiveBatch(userId);
    if (!context || !context.batch) {
      return null;
    }

    const { farmer, farm, batch } = context;

    // Determine start of current day in Asia/Kolkata
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

    // Fetch today's log if submitted
    const todayLog = await prisma.dailyHealthLog.findFirst({
      where: {
        batchId: batch.id,
        createdAt: { gte: startOfDay },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch historical logs (up to 14 days)
    const recentLogs = await prisma.dailyHealthLog.findMany({
      where: { batchId: batch.id },
      orderBy: { date: "desc" },
      take: 14,
    });

    // Fetch latest alerts
    const recentAlerts = await prisma.alert.findMany({
      where: { batchId: batch.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        caseRecords: true,
      },
    });

    const latestAlert = recentAlerts[0] || null;

    // Calculate rolling 7-day baseline
    const baseline = calculateBatchBaseline(recentLogs);
    const rules = await getAlertRulesMap();

    // Reconstruct risk assessment for the latest log/alert
    let latestRisk: RiskAssessment | null = null;
    if (todayLog) {
      latestRisk = calculateRisk(
        {
          mortality: todayLog.mortality,
          feedKg: todayLog.feedKg,
          waterLitres: todayLog.waterLitres,
          eggCount: todayLog.eggCount,
          symptoms: todayLog.symptoms,
          shedTemp: todayLog.shedTemp,
          notes: todayLog.notes,
        },
        baseline,
        batch,
        rules
      );
    } else if (latestAlert && latestAlert.signalsTriggered) {
      // Use stored alert metadata
      const signals = latestAlert.signalsTriggered as any;
      latestRisk = {
        severity: latestAlert.severity as any,
        reasons: latestAlert.reason ? latestAlert.reason.split("; ") : [],
        recommendations: [],
        signalsTriggered: signals,
      };
    }

    const lastCheckinTime = todayLog
      ? todayLog.createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        })
      : recentLogs[0]
      ? recentLogs[0].createdAt.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Kolkata",
        })
      : null;

    return {
      farmer,
      farm,
      batch,
      todayLog,
      latestAlert,
      recentLogs,
      recentAlerts,
      baseline,
      latestRisk,
      lastCheckinTime,
      isCheckedInToday: Boolean(todayLog),
    };
  }

  /**
   * Saves a new DailyHealthLog, runs baseline + risk engine,
   * creates Alert, and auto-escalates to CaseRecord if RED.
   */
  async processCheckin(userId: string, input: SentinelCheckinInput) {
    const context = await this.getFarmerActiveBatch(userId);
    if (!context || !context.batch) {
      throw new Error("No active flock found. Please register or activate a flock first.");
    }

    const { farmer, batch } = context;

    // Impossible value guard
    if (input.mortality > batch.currentBirds) {
      throw new Error(
        `Reported mortality (${input.mortality}) cannot exceed the current flock size (${batch.currentBirds} birds).`
      );
    }

    // Convert feed bags if necessary (1 bag = 50 kg)
    let finalFeedKg = input.feedKg;
    if (input.feedUnit === "BAGS" && typeof input.feedKg === "number") {
      finalFeedKg = input.feedKg * 50;
    }

    // Handle "Don't know" water intake
    const finalWaterLitres = input.waterUnknown ? null : input.waterLitres;

    // Load recent logs for rolling baseline
    const historicalLogs = await prisma.dailyHealthLog.findMany({
      where: { batchId: batch.id },
      orderBy: { date: "desc" },
      take: 14,
    });

    const baseline = calculateBatchBaseline(historicalLogs);
    const rules = await getAlertRulesMap();

    // Compute deterministic risk score
    const risk = calculateRisk(
      {
        ...input,
        feedKg: finalFeedKg,
        waterLitres: finalWaterLitres,
      },
      baseline,
      batch,
      rules
    );

    // Prisma Transaction: save log, adjust bird count, create alert & optional case
    return await prisma.$transaction(
      async (tx) => {

      // 1. Create DailyHealthLog
      const logDate = new Date();
      const createdLog = await tx.dailyHealthLog.create({
        data: {
          batchId: batch.id,
          date: logDate,
          mortality: input.mortality,
          feedKg: finalFeedKg,
          waterLitres: finalWaterLitres,
          eggCount: input.eggCount || null,
          symptoms: input.symptoms,
          shedTemp: input.shedTemp || null,
          notes: input.notes || null,
        },
      });

      // 2. Decrement living flock count by today's mortality
      if (input.mortality > 0) {
        await tx.batch.update({
          where: { id: batch.id },
          data: {
            currentBirds: Math.max(0, batch.currentBirds - input.mortality),
          },
        });
      }

      // 3. Map severity
      const severityEnum =
        risk.severity === "RED"
          ? AlertSeverity.RED
          : risk.severity === "AMBER"
          ? AlertSeverity.AMBER
          : AlertSeverity.GREEN;

      // 4. Create Alert record
      const createdAlert = await tx.alert.create({
        data: {
          batchId: batch.id,
          severity: severityEnum,
          reason: risk.reasons.join("; ") || "Routine flock status normal",
          signalsTriggered: JSON.parse(JSON.stringify(risk.signalsTriggered)),
          escalated: risk.severity === "RED",
        },
      });

      let createdCase = null;

      // 5. Hard Rule / Requirement 4: Auto-create CaseRecord if RED
      if (risk.severity === "RED") {
        createdCase = await tx.caseRecord.create({
          data: {
            farmerId: farmer.id,
            batchId: batch.id,
            alertId: createdAlert.id,
            symptomsSummary: [
              `Mortality: ${input.mortality} birds`,
              input.symptoms.length > 0 ? `Symptoms: ${input.symptoms.join(", ")}` : "",
              finalWaterLitres ? `Water: ${finalWaterLitres}L` : "",
              risk.reasons.join("; "),
            ]
              .filter(Boolean)
              .join(" | ")
              .slice(0, 500),
            aiSummary: risk.reasons.join(". ").slice(0, 500),
            status: CaseStatus.CREATED,
          },
        });

        // 6. AuditLog and Notification Stub
        await tx.auditLog.create({
          data: {
            actorId: farmer.userId,
            action: "SENTINEL_RED_ALERT_ESCALATION",
            entityType: "CaseRecord",
            entityId: createdCase.id,
            metadata: JSON.parse(
              JSON.stringify({
                alertId: createdAlert.id,
                reasons: risk.reasons,
                signals: risk.signalsTriggered,
                notificationStatus: "QUEUED_STUB",
              })
            ),
          },
        });


        console.log(
          `[Pankh Sentinel Notification Stub] 🚨 Urgent RED Alert created for Farmer ${farmer.user?.name || farmer.id} (${farmer.district}, Punjab). Case ID: ${createdCase.id}. WhatsApp/SMS alert dispatch logged for Phase 8.`
        );
      }

      return {
        log: createdLog,
        alert: createdAlert,
        caseRecord: createdCase,
        risk,
        baseline,
      };
    }, { timeout: 25000, maxWait: 15000 });
  }


  /**
   * Handles farmer action resolution buttons: "Resolved", "Still happening", "Vet contacted".
   */
  async handleFarmerAction(
    userId: string,
    alertId: string,
    action: FarmerActionType,
    notes?: string
  ) {
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        caseRecords: true,
        batch: {
          include: {
            farm: {
              include: { farmer: true },
            },
          },
        },
      },
    });

    if (!alert) {
      throw new Error("Alert not found");
    }

    if (alert.batch.farm.farmer.userId !== userId) {
      throw new Error("Unauthorized to modify this alert");
    }

    const signals = (alert.signalsTriggered as any) || {};
    signals.farmerAction = action;
    signals.farmerActionTimestamp = new Date().toISOString();
    if (notes) signals.farmerActionNotes = notes;

    return await prisma.$transaction(async (tx) => {
      // Acknowledge alert
      const updatedAlert = await tx.alert.update({
        where: { id: alertId },
        data: {
          acknowledged: true,
          signalsTriggered: signals,
        },
      });

      // Update associated case records if present
      if (alert.caseRecords.length > 0) {
        for (const caseRecord of alert.caseRecords) {
          let newStatus = caseRecord.status;
          if (action === "RESOLVED") {
            newStatus = CaseStatus.RESOLVED;
          } else if (action === "VET_CONTACTED") {
            newStatus = CaseStatus.CONTACTED;
          }

          await tx.caseRecord.update({
            where: { id: caseRecord.id },
            data: { status: newStatus },
          });
        }
      }

      // Record AuditLog
      await tx.auditLog.create({
        data: {
          actorId: userId,
          action: `SENTINEL_FARMER_ACTION_${action}`,
          entityType: "Alert",
          entityId: alertId,
          metadata: { action, notes },
        },
      });

      return updatedAlert;
    }, { timeout: 25000, maxWait: 15000 });
  }
}


export const sentinelService = new SentinelService();
