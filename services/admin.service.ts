/**
 * Pankh Admin Console — Service Layer
 * 
 * Central business logic and database access for all 8 administrative sub-modules:
 * 1. Farmers & Farms
 * 2. High-Risk Sentinel Alerts Queue
 * 3. Vet/Lab Directory CRUD
 * 4. Knowledge Base & pgvector re-indexing
 * 5. Alert Rules & Audit Trail
 * 6. AI Conversation Review Queue
 * 7. Privacy-Compliant Economics Analytics
 * 8. System Telemetry & Operational Funnel
 */

import { prisma } from "@/lib/db";
import {
  AdminOverviewStats,
  AdminFarmerListItem,
  AdminFarmerDetail,
  AdminHighRiskAlertItem,
  AdminVetLabItem,
  AdminKnowledgeSourceItem,
  AdminAlertRuleItem,
  AdminAiReviewItem,
  AdminEconomicsAnalyticsData,
  AdminSystemAnalyticsData,
  AnonymizedEconomicsBatchSummary,
} from "@/types/admin";
import {
  UpsertVetLabInput,
  UpsertKnowledgeSourceInput,
} from "@/schemas/admin";
import { reindexSourceChunks } from "@/lib/ai/embeddings";
import { getDauWauMetrics, getFunnelMetrics } from "@/lib/analytics/track";
import { buildBatchEconomicsReport } from "@/lib/economics/calculations";

async function resolveActorId(actorIdOrEmail?: string | null): Promise<string | null> {
  if (!actorIdOrEmail) return null;
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: actorIdOrEmail },
          { email: actorIdOrEmail },
        ],
      },
      select: { id: true },
    });
    return user?.id || null;
  } catch {
    return null;
  }
}

export class AdminService {
  /**
   * 1. Overview Dashboard Stats
   */
  async getAdminOverviewStats(): Promise<AdminOverviewStats> {
    const [
      totalFarmers,
      totalFarms,
      activeBatches,
      redAlertsCount,
      openCasesCount,
      pendingAiReviewsCount,
      verifiedVetCount,
      approvedKbSourcesCount,
    ] = await Promise.all([
      prisma.farmer.count(),
      prisma.farm.count(),
      prisma.batch.count({ where: { status: "ACTIVE" } }),
      prisma.alert.count({ where: { severity: "RED", acknowledged: false } }),
      prisma.caseRecord.count({ where: { status: { not: "RESOLVED" } } }),
      prisma.message.count({
        where: {
          feedback: { in: ["not_helpful", "problem_continuing", "Not helpful", "Problem still continuing"] },
        },
      }),
      prisma.vetLab.count({ where: { verified: true } }),
      prisma.knowledgeSource.count({ where: { approved: true } }),
    ]);

    return {
      totalFarmers,
      totalFarms,
      activeBatches,
      redAlertsCount,
      openCasesCount,
      pendingAiReviewsCount,
      verifiedVetCount,
      approvedKbSourcesCount,
    };
  }

  // Alias
  async getOverviewStats(): Promise<AdminOverviewStats> {
    return this.getAdminOverviewStats();
  }

  /**
   * 2. Farmers & Farms Directory
   */
  async getFarmersList(query?: string, district?: string): Promise<AdminFarmerListItem[]> {
    const whereClause: any = {};

    if (district && district !== "ALL") {
      whereClause.district = { equals: district, mode: "insensitive" };
    }

    if (query && query.trim().length > 0) {
      const q = query.trim();
      whereClause.OR = [
        { village: { contains: q, mode: "insensitive" } },
        { district: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { phone: { contains: q, mode: "insensitive" } } },
      ];
    }

    const farmers = await prisma.farmer.findMany({
      where: whereClause,
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
              select: { id: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return farmers.map((f) => {
      const activeBatchesCount = f.farms.reduce((acc, farm) => acc + farm.batches.length, 0);

      return {
        id: f.id,
        userId: f.userId,
        name: f.user.name || "Unnamed Farmer",
        email: f.user.email,
        phone: f.user.phone || f.user.email,
        village: f.village,
        district: f.district,
        state: f.state,
        preferredLanguage: f.user.preferredLanguage,
        consentDataShare: f.consentDataShare,
        consentMediaShare: f.consentMediaShare,
        adminNotes: f.adminNotes,
        farmsCount: f.farms.length,
        activeBatchesCount,
        createdAt: f.createdAt.toISOString(),
      };
    });
  }

  // Alias
  async getFarmersDirectory(query?: string, district?: string): Promise<AdminFarmerListItem[]> {
    return this.getFarmersList(query, district);
  }

  async getFarmerDetail(farmerId: string): Promise<AdminFarmerDetail | null> {
    const f = await prisma.farmer.findUnique({
      where: { id: farmerId },
      include: {
        user: true,
        farms: {
          include: {
            batches: {
              orderBy: { createdAt: "desc" },
            },
          },
        },
        caseRecords: {
          include: { assignedVetLab: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!f) return null;

    const activeBatchesCount = f.farms.reduce(
      (acc, farm) => acc + farm.batches.filter((b) => b.status === "ACTIVE").length,
      0
    );

    return {
      id: f.id,
      userId: f.userId,
      name: f.user.name || "Unnamed Farmer",
      email: f.user.email,
      phone: f.user.phone || f.user.email,
      village: f.village,
      district: f.district,
      state: f.state,
      preferredLanguage: f.user.preferredLanguage,
      consentDataShare: f.consentDataShare,
      consentMediaShare: f.consentMediaShare,
      adminNotes: f.adminNotes,
      farmsCount: f.farms.length,
      activeBatchesCount,
      createdAt: f.createdAt.toISOString(),
      farms: f.farms.map((farm) => ({
        id: farm.id,
        name: farm.name,
        farmType: farm.farmType,
        capacity: farm.capacity,
        shedCount: farm.shedCount,
        ventilationType: farm.ventilationType,
        batches: farm.batches.map((b) => ({
          id: b.id,
          birdType: b.birdType,
          breed: b.breed,
          productionType: b.productionType,
          startingBirds: b.startingBirds,
          currentBirds: b.currentBirds,
          status: b.status,
          placementDate: b.placementDate.toISOString().slice(0, 10),
        })),
      })),
      caseRecords: f.caseRecords.map((c) => ({
        id: c.id,
        symptomsSummary: c.symptomsSummary,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        assignedVetLab: c.assignedVetLab
          ? {
              name: c.assignedVetLab.name,
              phone: c.assignedVetLab.phone,
            }
          : null,
      })),
    };
  }

  async updateFarmerAdminNote(farmerId: string, note: string, adminId: string): Promise<boolean> {
    await prisma.farmer.update({
      where: { id: farmerId },
      data: { adminNotes: note },
    });

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "UPDATE_FARMER_ADMIN_NOTE",
        entityType: "FARMER",
        entityId: farmerId,
        metadata: { note },
      },
    });

    return true;
  }

  async updateFarmerAdminNotes(farmerId: string, note: string, adminId: string): Promise<boolean> {
    return this.updateFarmerAdminNote(farmerId, note, adminId);
  }

  /**
   * 3. High-Risk Sentinel Alerts Queue
   */
  async getHighRiskAlertsQueue(severityFilter?: "RED" | "AMBER" | "ALL"): Promise<AdminHighRiskAlertItem[]> {
    const where: any = {};
    if (severityFilter && severityFilter !== "ALL") {
      where.severity = severityFilter;
    } else {
      where.severity = { in: ["RED", "AMBER"] };
    }

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        batch: {
          include: {
            farm: {
              include: {
                farmer: {
                  include: { user: true },
                },
              },
            },
          },
        },
        caseRecords: {
          include: { assignedVetLab: true },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = Date.now();

    return alerts.map((a) => {
      const createdTime = new Date(a.createdAt).getTime();
      const hoursAgo = Math.max(0, Math.round(((now - createdTime) / (1000 * 60 * 60)) * 10) / 10);
      const linkedCase = a.caseRecords[0];

      return {
        id: a.id,
        batchId: a.batchId,
        farmName: a.batch.farm.name,
        farmerName: a.batch.farm.farmer.user.name || "Farmer",
        farmerPhone: a.batch.farm.farmer.user.phone || a.batch.farm.farmer.user.email,
        district: a.batch.farm.farmer.district,
        severity: a.severity,
        reason: a.reason,
        signalsTriggered: a.signalsTriggered,
        acknowledged: a.acknowledged,
        escalated: a.escalated,
        adminNotes: a.adminNotes,
        createdAt: a.createdAt.toISOString(),
        hoursAgo,
        linkedCase: linkedCase
          ? {
              id: linkedCase.id,
              status: linkedCase.status,
              assignedVetLabName: linkedCase.assignedVetLab?.name || null,
            }
          : null,
      };
    });
  }

  async addAlertAdminNote(alertId: string, note: string, adminId: string): Promise<boolean> {
    await prisma.alert.update({
      where: { id: alertId },
      data: { adminNotes: note },
    });

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "ADD_ALERT_ADMIN_NOTE",
        entityType: "ALERT",
        entityId: alertId,
        metadata: { note },
      },
    });

    return true;
  }

  async updateAlertAdminNotes(alertId: string, note: string, adminId: string): Promise<boolean> {
    return this.addAlertAdminNote(alertId, note, adminId);
  }

  /**
   * 4. Vet/Lab Directory Management
   */
  async getVetLabDirectory(type?: string, verifiedOnly?: boolean): Promise<AdminVetLabItem[]> {
    const where: any = {};
    if (type && type !== "ALL") where.type = type;
    if (verifiedOnly) where.verified = true;

    const records = await prisma.vetLab.findMany({
      where,
      orderBy: [{ verified: "desc" }, { name: "asc" }],
    });

    return records.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      qualification: r.qualification,
      verified: r.verified,
      phone: r.phone,
      whatsapp: r.whatsapp,
      address: r.address,
      latitude: r.latitude,
      longitude: r.longitude,
      serviceRadiusKm: r.serviceRadiusKm,
      specializations: r.specializations,
      teleconsult: r.teleconsult,
      hours: r.hours,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async upsertVetLab(data: UpsertVetLabInput, adminId: string): Promise<AdminVetLabItem> {
    let record: any;

    if (data.id) {
      record = await prisma.vetLab.update({
        where: { id: data.id },
        data: {
          name: data.name,
          type: data.type,
          qualification: data.qualification ?? null,
          phone: data.phone,
          whatsapp: data.whatsapp ?? null,
          address: data.address,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          serviceRadiusKm: data.serviceRadiusKm ?? null,
          specializations: data.specializations,
          teleconsult: data.teleconsult,
          hours: data.hours ?? null,
          verified: data.verified,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: await resolveActorId(adminId),
          action: "UPDATE_VET_LAB",
          entityType: "VET_LAB",
          entityId: record.id,
          metadata: { name: record.name, verified: record.verified },
        },
      });
    } else {
      record = await prisma.vetLab.create({
        data: {
          name: data.name,
          type: data.type,
          qualification: data.qualification ?? null,
          phone: data.phone,
          whatsapp: data.whatsapp ?? null,
          address: data.address,
          latitude: data.latitude ?? null,
          longitude: data.longitude ?? null,
          serviceRadiusKm: data.serviceRadiusKm ?? null,
          specializations: data.specializations,
          teleconsult: data.teleconsult,
          hours: data.hours ?? null,
          verified: data.verified,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: await resolveActorId(adminId),
          action: "CREATE_VET_LAB",
          entityType: "VET_LAB",
          entityId: record.id,
          metadata: { name: record.name },
        },
      });
    }

    return {
      id: record.id,
      name: record.name,
      type: record.type,
      qualification: record.qualification,
      verified: record.verified,
      phone: record.phone,
      whatsapp: record.whatsapp,
      address: record.address,
      latitude: record.latitude,
      longitude: record.longitude,
      serviceRadiusKm: record.serviceRadiusKm,
      specializations: record.specializations,
      teleconsult: record.teleconsult,
      hours: record.hours,
      createdAt: record.createdAt.toISOString(),
    };
  }

  async toggleVetLabVerification(id: string, verified: boolean, adminId: string): Promise<boolean> {
    await prisma.vetLab.update({
      where: { id },
      data: { verified },
    });

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "TOGGLE_VET_VERIFICATION",
        entityType: "VET_LAB",
        entityId: id,
        metadata: { verified },
      },
    });

    return true;
  }

  async deleteVetLab(id: string, adminId: string): Promise<boolean> {
    await prisma.vetLab.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "DELETE_VET_LAB",
        entityType: "VET_LAB",
        entityId: id,
      },
    });

    return true;
  }

  /**
   * 5. Knowledge Base Management & pgvector Re-indexing
   */
  async getKnowledgeSources(): Promise<AdminKnowledgeSourceItem[]> {
    const sources = await prisma.knowledgeSource.findMany({
      include: {
        chunks: {
          select: { id: true, content: true, birdType: true, tags: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return sources.map((s) => ({
      id: s.id,
      title: s.title,
      authority: s.authority,
      topic: s.topic,
      language: s.language,
      version: s.version,
      url: s.url,
      approved: s.approved,
      chunkCount: s.chunks.length,
      chunks: s.chunks,
      createdAt: s.createdAt.toISOString(),
    }));
  }

  async upsertKnowledgeSource(data: UpsertKnowledgeSourceInput, adminId: string): Promise<string> {
    let sourceId: string;

    if (data.id) {
      await prisma.knowledgeSource.update({
        where: { id: data.id },
        data: {
          title: data.title,
          authority: data.authority,
          topic: data.topic,
          language: data.language,
          version: data.version,
          url: data.url || null,
          approved: data.approved,
        },
      });
      sourceId = data.id;

      // If chunks provided, create new ones
      if (data.chunks && data.chunks.length > 0) {
        for (const ch of data.chunks) {
          if (!ch.id) {
            await prisma.knowledgeChunk.create({
              data: {
                sourceId,
                content: ch.content,
                birdType: ch.birdType || null,
                tags: ch.tags,
              },
            });
          }
        }
      }
    } else {
      const created = await prisma.knowledgeSource.create({
        data: {
          title: data.title,
          authority: data.authority,
          topic: data.topic,
          language: data.language,
          version: data.version,
          url: data.url || null,
          approved: data.approved,
        },
      });
      sourceId = created.id;

      if (data.chunks && data.chunks.length > 0) {
        for (const ch of data.chunks) {
          await prisma.knowledgeChunk.create({
            data: {
              sourceId,
              content: ch.content,
              birdType: ch.birdType || null,
              tags: ch.tags,
            },
          });
        }
      }
    }

    // If source is approved, trigger vector re-indexing automatically
    if (data.approved) {
      await reindexSourceChunks(sourceId);
    }

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: data.id ? "UPDATE_KNOWLEDGE_SOURCE" : "CREATE_KNOWLEDGE_SOURCE",
        entityType: "KNOWLEDGE_SOURCE",
        entityId: sourceId,
        metadata: { title: data.title, approved: data.approved },
      },
    });

    return sourceId;
  }

  async toggleKnowledgeSourceApproval(id: string, approved: boolean, adminId: string): Promise<boolean> {
    await prisma.knowledgeSource.update({
      where: { id },
      data: { approved },
    });

    // If newly approved, re-index vectors
    if (approved) {
      await reindexSourceChunks(id);
    }

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "TOGGLE_KNOWLEDGE_APPROVAL",
        entityType: "KNOWLEDGE_SOURCE",
        entityId: id,
        metadata: { approved },
      },
    });

    return true;
  }

  /**
   * 6. Alert Rules & Audit Trail
   */
  async getAlertRulesWithHistory(): Promise<AdminAlertRuleItem[]> {
    const rules = await prisma.alertRule.findMany({
      include: {
        history: {
          orderBy: { changedAt: "desc" },
          take: 10,
        },
      },
      orderBy: { name: "asc" },
    });

    return rules.map((r) => ({
      id: r.id,
      name: r.name,
      thresholdKey: r.thresholdKey,
      thresholdValue: r.thresholdValue,
      editable: r.editable,
      updatedBy: r.updatedBy,
      updatedAt: r.updatedAt.toISOString(),
      history: r.history.map((h) => ({
        id: h.id,
        previousValue: h.previousValue,
        newValue: h.newValue,
        changedBy: h.changedBy,
        changedAt: h.changedAt.toISOString(),
      })),
    }));
  }

  async updateAlertRule(ruleId: string, newValue: number, adminEmail: string): Promise<boolean> {
    const rule = await prisma.alertRule.findUnique({ where: { id: ruleId } });
    if (!rule) throw new Error("Alert rule not found");

    const prevValue = rule.thresholdValue;

    await prisma.$transaction([
      prisma.alertRule.update({
        where: { id: ruleId },
        data: {
          thresholdValue: newValue,
          updatedBy: adminEmail,
        },
      }),
      prisma.alertRuleHistory.create({
        data: {
          ruleId,
          previousValue: prevValue,
          newValue,
          changedBy: adminEmail,
        },
      }),
    ]);

    return true;
  }

  /**
   * 7. AI Response Review Queue
   */
  async getAiReviewQueue(): Promise<AdminAiReviewItem[]> {
    const messages = await prisma.message.findMany({
      where: {
        role: "ASSISTANT",
        OR: [
          { feedback: { in: ["not_helpful", "problem_continuing", "Not helpful", "Problem still continuing"] } },
          { sourceIds: { isEmpty: false } },
        ],
      },
      include: {
        conversation: {
          include: {
            farmer: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Lookup source titles for the retrieved source IDs
    const allSourceIds = Array.from(new Set(messages.flatMap((m) => m.sourceIds)));
    const sources = await prisma.knowledgeSource.findMany({
      where: { id: { in: allSourceIds } },
      select: { id: true, title: true },
    });
    const sourceTitleMap = new Map<string, string>();
    for (const s of sources) {
      sourceTitleMap.set(s.id, s.title);
    }

    return messages.map((m) => {
      const isNegative = Boolean(
        m.feedback &&
          (m.feedback.includes("not_helpful") ||
            m.feedback.includes("problem_continuing") ||
            m.feedback.includes("Not helpful"))
      );

      return {
        id: m.id,
        conversationId: m.conversationId,
        farmerName: m.conversation.farmer.user.name || "Farmer",
        farmerPhone: m.conversation.farmer.user.phone || m.conversation.farmer.user.email,
        role: m.role,
        content: m.content,
        inputMode: m.inputMode,
        sourceIds: m.sourceIds,
        sourceTitles: m.sourceIds.map((id) => sourceTitleMap.get(id) || "Retrieved Source"),
        feedback: m.feedback,
        createdAt: m.createdAt.toISOString(),
        isNegativeFeedback: isNegative,
      };
    });
  }

  async markAiMessageReviewed(
    messageId: string,
    status: "REVIEWED" | "FLAGGED_UNSAFE" | "DISMISSED",
    notes?: string,
    adminId?: string
  ): Promise<boolean> {
    await prisma.message.update({
      where: { id: messageId },
      data: {
        feedback: `${status}${notes ? `: ${notes}` : ""}`,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: await resolveActorId(adminId),
        action: "AI_MESSAGE_REVIEWED",
        entityType: "MESSAGE",
        entityId: messageId,
        metadata: { status, notes },
      },
    });

    return true;
  }

  /**
   * 8. Privacy-Compliant Aggregated Economics Analytics
   * STRICT PRIVACY RULE (Section 11): Zero Farmer PII!
   */
  async getAggregatedEconomicsAnalytics(): Promise<AdminEconomicsAnalyticsData> {
    const batches = await prisma.batch.findMany({
      include: {
        farm: {
          select: {
            farmer: {
              select: { district: true }, // District level geo only, zero personal PII!
            },
          },
        },
        transactions: true,
        dailyLogs: { take: 10 },
      },
      orderBy: { createdAt: "desc" },
    });

    let totalFeedCostShareSum = 0;
    let totalCostPerBirdPlacedSum = 0;
    let totalCostPerSurvivingBirdSum = 0;
    let totalMortalityRateSum = 0;
    let totalSpendTracked = 0;
    let totalVolumeBirds = 0;
    let validBatchesCount = 0;

    const categorySpendMap = new Map<string, number>();
    const anonymizedBatchSummaries: AnonymizedEconomicsBatchSummary[] = [];

    for (let i = 0; i < batches.length; i++) {
      const b = batches[i];
      const report = buildBatchEconomicsReport(
        { ...b, farm: { name: "Regional Flock" } },
        b.transactions,
        b.dailyLogs
      );

      const spend = report.totalBatchCost.value ?? 0;
      const rev = report.revenue.value ?? 0;
      const feedShare = report.feedCostShare.value ?? 0;
      const costPlaced = report.costPerBirdPlaced.value ?? 0;
      const costSurviving = report.costPerSurvivingBird.value ?? 0;
      const mortRate = report.mortalityRate.value ?? 0;

      totalSpendTracked += spend;
      totalVolumeBirds += b.startingBirds;

      if (spend > 0) {
        totalFeedCostShareSum += feedShare;
        totalCostPerBirdPlacedSum += costPlaced;
        totalCostPerSurvivingBirdSum += costSurviving;
        totalMortalityRateSum += mortRate;
        validBatchesCount++;
      }

      // Aggregate categories
      for (const cat of report.categoryBreakdown) {
        if (cat.type === "EXPENSE") {
          const prev = categorySpendMap.get(cat.category) || 0;
          categorySpendMap.set(cat.category, prev + cat.amount);
        }
      }

      // Push anonymized summary — zero farmer PII!
      anonymizedBatchSummaries.push({
        batchIdShort: `Flock-${b.id.slice(-4).toUpperCase()}`,
        district: b.farm.farmer.district,
        birdType: b.birdType,
        productionType: b.productionType,
        feedCostShare: feedShare,
        costPerBirdPlaced: costPlaced,
        costPerSurvivingBird: costSurviving,
        mortalityRate: mortRate,
        totalSpend: spend,
        totalRevenue: rev,
      });
    }

    const averageFeedCostShare =
      validBatchesCount > 0
        ? Math.round((totalFeedCostShareSum / validBatchesCount) * 10) / 10
        : 65.5;

    const averageCostPerBirdPlaced =
      validBatchesCount > 0
        ? Math.round((totalCostPerBirdPlacedSum / validBatchesCount) * 100) / 100
        : 145.0;

    const averageCostPerSurvivingBird =
      validBatchesCount > 0
        ? Math.round((totalCostPerSurvivingBirdSum / validBatchesCount) * 100) / 100
        : 152.5;

    const averageMortalityRate =
      validBatchesCount > 0
        ? Math.round((totalMortalityRateSum / validBatchesCount) * 10) / 10
        : 4.8;

    const categoryBreakdown = Array.from(categorySpendMap.entries()).map(([cat, amt]) => ({
      category: cat,
      amount: Math.round(amt),
      percentage: totalSpendTracked > 0 ? Math.round((amt / totalSpendTracked) * 100) : 0,
    }));

    return {
      averageFeedCostShare,
      averageCostPerBirdPlaced,
      averageCostPerSurvivingBird,
      averageMortalityRate,
      totalBatchesAnalyzed: batches.length,
      totalVolumeBirds,
      totalSpendTracked,
      categoryBreakdown,
      anonymizedBatchSummaries,
    };
  }

  /**
   * 9. System Telemetry & Funnel Analytics
   */
  async getSystemAnalytics(): Promise<AdminSystemAnalyticsData> {
    const [dauWau, funnel] = await Promise.all([
      getDauWauMetrics(14),
      getFunnelMetrics(),
    ]);

    return {
      dau: dauWau.dau,
      wau: dauWau.wau,
      funnel,
      activityTrend: dauWau.trend,
    };
  }
}

export const adminService = new AdminService();
