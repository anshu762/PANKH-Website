import { prisma } from "@/lib/db";
import { CaseStatus, VetLabType, Prisma } from "@prisma/client";
import {
  CaseWithRelations,
  CaseSummaryPayload,
  VetLabDistanceResult,
  SendCaseSummaryResult,
} from "@/types/connect";
import { CreateFarmerCaseInput } from "@/schemas/connect";
import { generateCaseSummary } from "@/lib/connect/caseSummary";
import { rankVetLabs, DEFAULT_PUNJAB_ORIGIN, GeoPoint } from "@/lib/connect/matching";
import { dispatchCaseSummary } from "@/lib/connect/whatsapp";
import { evaluateCaseStatusNotification } from "@/lib/notifications/rules";

export class ConnectService {
  /**
   * Retrieves farmer and active batch context.
   */
  async getFarmerConnectContext(userId: string) {
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
   * Retrieves all cases for a farmer ordered by creation date.
   */
  async getFarmerCases(farmerId: string): Promise<CaseWithRelations[]> {
    const cases = await prisma.caseRecord.findMany({
      where: { farmerId },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        batch: true,
        alert: true,
        assignedVetLab: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return cases as unknown as CaseWithRelations[];
  }

  /**
   * Retrieves a specific case by ID with full relations.
   */
  async getCaseById(caseId: string): Promise<CaseWithRelations | null> {
    const record = await prisma.caseRecord.findUnique({
      where: { id: caseId },
      include: {
        farmer: {
          include: {
            user: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        batch: {
          include: {
            farm: true,
          },
        },
        alert: true,
        assignedVetLab: true,
      },
    });

    return record as unknown as CaseWithRelations | null;
  }

  /**
   * Creates a farmer-initiated escalation case and computes initial case summary.
   */
  async createFarmerCase(
    input: CreateFarmerCaseInput,
    farmerId: string,
    actorUserId?: string
  ): Promise<CaseWithRelations> {
    const batch = await prisma.batch.findFirst({
      where: {
        id: input.batchId,
        farm: { farmerId },
      },
    });

    if (!batch) {
      throw new Error("Specified flock batch not found for this farmer.");
    }

    // Format symptom string
    const combinedSymptoms = [
      input.symptomsDescription,
      input.selectedSymptoms.length > 0 ? `Observed: ${input.selectedSymptoms.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    // Create case record
    const caseRecord = await prisma.$transaction(
      async (tx) => {
        const created = await tx.caseRecord.create({
          data: {
            farmerId,
            batchId: input.batchId,
            symptomsSummary: combinedSymptoms,
            assignedVetLabId: input.assignedVetLabId || null,
            status: CaseStatus.CREATED,
            consentGiven: false,
          },
          include: {
            farmer: {
              include: {
                user: {
                  select: { name: true, phone: true },
                },
              },
            },
            batch: true,
            alert: true,
            assignedVetLab: true,
          },
        });

        if (actorUserId) {
          await tx.auditLog.create({
            data: {
              actorId: actorUserId,
              action: "CONNECT_CASE_CREATED_BY_FARMER",
              entityType: "CaseRecord",
              entityId: created.id,
              metadata: JSON.parse(
                JSON.stringify({
                  batchId: input.batchId,
                  symptoms: input.selectedSymptoms,
                })
              ),
            },
          });
        }

        return created;
      },
      { timeout: 25000, maxWait: 15000 }
    );

    // Generate and cache summary
    try {
      await this.generateSummaryForCase(caseRecord.id);
    } catch (err) {
      console.warn("Could not generate immediate summary on case creation:", err);
    }

    return (await this.getCaseById(caseRecord.id)) as CaseWithRelations;
  }

  /**
   * Generates structured and formatted WhatsApp Case Summary per Brief Section 5.3 & Hard Rule #1.
   */
  async generateSummaryForCase(caseId: string): Promise<CaseSummaryPayload> {
    const caseRecord = await prisma.caseRecord.findUnique({
      where: { id: caseId },
      include: {
        farmer: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
        batch: {
          include: {
            farm: true,
          },
        },
        alert: true,
      },
    });

    if (!caseRecord) {
      throw new Error(`CaseRecord ${caseId} not found.`);
    }

    // Fetch up to 7 most recent daily health logs for trend analysis
    const recentLogs = await prisma.dailyHealthLog.findMany({
      where: { batchId: caseRecord.batchId },
      orderBy: { date: "desc" },
      take: 7,
    });

    // Extract symptoms from recent logs + case summary
    const logSymptoms = recentLogs.flatMap((l) => l.symptoms);
    const normalizedSymptoms = Array.from(new Set(logSymptoms));

    const summary = generateCaseSummary({
      caseId: caseRecord.id,
      farmer: {
        name: caseRecord.farmer.user?.name || null,
        phone: caseRecord.farmer.user?.phone || null,
        district: caseRecord.farmer.district,
        village: caseRecord.farmer.village,
      },
      batch: {
        id: caseRecord.batch.id,
        name: caseRecord.batch.breed,
        productionType: caseRecord.batch.productionType,
        breed: caseRecord.batch.breed,
        placedDate: caseRecord.batch.placementDate,
        currentBirds: caseRecord.batch.currentBirds,
        startingBirds: caseRecord.batch.startingBirds,
      },
      symptomsDescription: caseRecord.symptomsSummary,
      normalizedSymptoms,
      recentLogs: recentLogs.map((l) => ({
        date: l.date,
        mortality: l.mortality,
        feedKg: l.feedKg,
        waterLitres: l.waterLitres,
        eggCount: l.eggCount,
        shedTemp: l.shedTemp,
        symptoms: l.symptoms,
      })),
      alert: caseRecord.alert
        ? {
            severity: caseRecord.alert.severity,
            reason: caseRecord.alert.reason,
            signalsTriggered: caseRecord.alert.signalsTriggered,
          }
        : null,
    });

    // Update case record with the formatted summary
    await prisma.caseRecord.update({
      where: { id: caseId },
      data: {
        aiSummary: summary.formattedWhatsAppText,
      },
    });

    return summary;
  }

  /**
   * Matches and ranks verified VetLabs relative to a farm or case origin.
   */
  async matchVets(params: {
    originCoords?: GeoPoint;
    caseId?: string;
    radiusKm?: number;
    type?: VetLabType;
    teleconsultOnly?: boolean;
    limit?: number;
  }): Promise<VetLabDistanceResult[]> {
    const { originCoords, caseId, radiusKm, type, teleconsultOnly, limit = 5 } = params;

    let origin = originCoords || DEFAULT_PUNJAB_ORIGIN;
    let symptoms: string[] = [];

    if (caseId) {
      const caseRecord = await prisma.caseRecord.findUnique({
        where: { id: caseId },
        include: {
          batch: {
            include: { farm: true },
          },
        },
      });

      if (caseRecord) {
        if (caseRecord.batch.farm.latitude && caseRecord.batch.farm.longitude) {
          origin = {
            latitude: caseRecord.batch.farm.latitude,
            longitude: caseRecord.batch.farm.longitude,
          };
        }
        if (caseRecord.symptomsSummary) {
          symptoms = caseRecord.symptomsSummary
            .split(/[,|;]/)
            .map((s) => s.trim())
            .filter(Boolean);
        }
      }
    }

    const verifiedVets = await prisma.vetLab.findMany({
      where: { verified: true },
    });

    return rankVetLabs(verifiedVets, origin, {
      radiusKm,
      type,
      teleconsultOnly,
      searchSymptoms: symptoms,
      limit,
    });
  }

  /**
   * Dispatches case summary to a selected Vet/Lab with farmer consent and updates case status to CONTACTED.
   */
  async sendCaseSummaryToVet(params: {
    caseId: string;
    vetLabId: string;
    consentGiven: boolean;
    channel?: "WHATSAPP" | "SMS";
    actorUserId: string;
  }): Promise<{ result: SendCaseSummaryResult; caseRecord: CaseWithRelations }> {
    const { caseId, vetLabId, consentGiven, channel = "WHATSAPP", actorUserId } = params;

    if (!consentGiven) {
      throw new Error(
        "Explicit farmer consent is required before sharing flock records with external specialists."
      );
    }

    const caseRecord = await this.getCaseById(caseId);
    if (!caseRecord) {
      throw new Error(`Case ${caseId} does not exist.`);
    }

    const vetLab = await prisma.vetLab.findUnique({
      where: { id: vetLabId },
    });

    if (!vetLab) {
      throw new Error(`Vet/Lab record ${vetLabId} does not exist.`);
    }

    // Generate or get case summary
    let summaryText = caseRecord.aiSummary;
    if (!summaryText) {
      const summaryPayload = await this.generateSummaryForCase(caseId);
      summaryText = summaryPayload.formattedWhatsAppText;
    }

    // Target recipient phone (prefer whatsapp if available and channel is WHATSAPP)
    const targetPhone =
      channel === "WHATSAPP" && vetLab.whatsapp ? vetLab.whatsapp : vetLab.phone;

    // Dispatch via Native WhatsApp Click-to-Chat engine
    const dispatchResult = await dispatchCaseSummary({
      toPhone: targetPhone,
      messageText: summaryText,
      channel,
    });

    // Update CaseRecord and record audit log in transaction
    const updatedCase = await prisma.$transaction(
      async (tx) => {
        const updated = await tx.caseRecord.update({
          where: { id: caseId },
          data: {
            consentGiven: true,
            assignedVetLabId: vetLabId,
            status: CaseStatus.CONTACTED,
          },
          include: {
            farmer: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
            batch: true,
            alert: true,
            assignedVetLab: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: actorUserId,
            action: "CONNECT_CASE_DISPATCHED_TO_VET",
            entityType: "CaseRecord",
            entityId: caseId,
            metadata: JSON.parse(
              JSON.stringify({
                vetLabId,
                vetName: vetLab.name,
                recipientPhone: targetPhone,
                channel,
                dispatchStatus: dispatchResult.status,
                whatsappUrl: dispatchResult.whatsappUrl,
                messageSid: dispatchResult.messageSid,
              })
            ),
          },
        });

        return updated;
      },
      { timeout: 25000, maxWait: 15000 }
    );

    return {
      result: dispatchResult,
      caseRecord: updatedCase as unknown as CaseWithRelations,
    };
  }

  /**
   * Updates case status (e.g. Appointment scheduled, Advice received, Resolved).
   */
  async updateCaseStatus(params: {
    caseId: string;
    status: CaseStatus;
    actorUserId: string;
    notes?: string;
  }): Promise<CaseWithRelations> {
    const { caseId, status, actorUserId, notes } = params;

    const existing = await prisma.caseRecord.findUnique({
      where: { id: caseId },
    });

    if (!existing) {
      throw new Error(`Case ${caseId} does not exist.`);
    }

    const updated = await prisma.$transaction(
      async (tx) => {
        const record = await tx.caseRecord.update({
          where: { id: caseId },
          data: { status },
          include: {
            farmer: {
              include: {
                user: { select: { name: true, phone: true } },
              },
            },
            batch: true,
            alert: true,
            assignedVetLab: true,
          },
        });

        await tx.auditLog.create({
          data: {
            actorId: actorUserId,
            action: "CONNECT_CASE_STATUS_CHANGED",
            entityType: "CaseRecord",
            entityId: caseId,
            metadata: JSON.parse(
              JSON.stringify({
                previousStatus: existing.status,
                newStatus: status,
                notes: notes || null,
              })
            ),
          },
        });

        return record;
      },
      { timeout: 25000, maxWait: 15000 }
    );

    // Section 7.3: In-app + WhatsApp status notification
    evaluateCaseStatusNotification(
      updated.farmerId,
      updated.id,
      status,
      updated.assignedVetLab?.name
    ).catch((err) => console.error("Error dispatching case status notification:", err));

    return updated as unknown as CaseWithRelations;
  }
}

export const connectService = new ConnectService();
