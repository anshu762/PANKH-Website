"use server";

import { auth } from "@/auth";
import { adminService } from "@/services/admin.service";
import {
  upsertVetLabSchema,
  updateAlertRuleSchema,
  upsertKnowledgeSourceSchema,
  toggleApprovalSchema,
  addAlertNoteSchema,
  addFarmerNoteSchema,
  reviewAiMessageSchema,
  UpsertVetLabInput,
  UpsertKnowledgeSourceInput,
} from "@/schemas/admin";
import { revalidatePath } from "next/cache";

/**
 * Validates that current session has administrative privileges.
 */
async function requireAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in");
  }
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Admin privileges required");
  }
  return session;
}

export async function getAdminOverviewStatsAction() {
  try {
    await requireAdminSession();
    const stats = await adminService.getAdminOverviewStats();
    return { success: true, stats };
  } catch (error: any) {
    return { error: error.message || "Failed to load admin stats" };
  }
}

export async function getFarmersListAction(query?: string, district?: string) {
  try {
    await requireAdminSession();
    const farmers = await adminService.getFarmersList(query, district);
    return { success: true, farmers };
  } catch (error: any) {
    return { error: error.message || "Failed to load farmers list" };
  }
}

export async function getFarmerDetailAction(farmerId: string) {
  try {
    await requireAdminSession();
    const farmer = await adminService.getFarmerDetail(farmerId);
    return { success: true, farmer };
  } catch (error: any) {
    return { error: error.message || "Failed to load farmer details" };
  }
}

export async function updateFarmerNoteAction(farmerId: string, note: string) {
  try {
    const session = await requireAdminSession();
    const validated = addFarmerNoteSchema.parse({ farmerId, note });
    await adminService.updateFarmerAdminNote(validated.farmerId, validated.note, session.user.id);
    revalidatePath("/admin/farmers");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update farmer note" };
  }
}

export async function getHighRiskAlertsQueueAction(severityFilter?: "RED" | "AMBER" | "ALL") {
  try {
    await requireAdminSession();
    const alerts = await adminService.getHighRiskAlertsQueue(severityFilter);
    return { success: true, alerts };
  } catch (error: any) {
    return { error: error.message || "Failed to load alerts queue" };
  }
}

export async function addAlertAdminNoteAction(alertId: string, note: string) {
  try {
    const session = await requireAdminSession();
    const validated = addAlertNoteSchema.parse({ alertId, note });
    await adminService.addAlertAdminNote(validated.alertId, validated.note, session.user.id);
    revalidatePath("/admin/alerts");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to save alert note" };
  }
}

export async function getVetLabDirectoryAction(type?: string, verifiedOnly?: boolean) {
  try {
    await requireAdminSession();
    const records = await adminService.getVetLabDirectory(type, verifiedOnly);
    return { success: true, records };
  } catch (error: any) {
    return { error: error.message || "Failed to load vet directory" };
  }
}

export async function upsertVetLabAction(data: UpsertVetLabInput) {
  try {
    const session = await requireAdminSession();
    const validated = upsertVetLabSchema.parse(data);
    const record = await adminService.upsertVetLab(validated, session.user.id);
    revalidatePath("/admin/vetlab");
    revalidatePath("/dashboard/connect");
    return { success: true, record };
  } catch (error: any) {
    return { error: error.message || "Failed to save specialist record" };
  }
}

export async function toggleVetLabVerificationAction(id: string, verified: boolean) {
  try {
    const session = await requireAdminSession();
    await adminService.toggleVetLabVerification(id, verified, session.user.id);
    revalidatePath("/admin/vetlab");
    revalidatePath("/dashboard/connect");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to toggle verification" };
  }
}

export async function deleteVetLabAction(id: string) {
  try {
    const session = await requireAdminSession();
    await adminService.deleteVetLab(id, session.user.id);
    revalidatePath("/admin/vetlab");
    revalidatePath("/dashboard/connect");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete record" };
  }
}

export async function getKnowledgeSourcesAction() {
  try {
    await requireAdminSession();
    const sources = await adminService.getKnowledgeSources();
    return { success: true, sources };
  } catch (error: any) {
    return { error: error.message || "Failed to load knowledge sources" };
  }
}

export async function upsertKnowledgeSourceAction(data: UpsertKnowledgeSourceInput) {
  try {
    const session = await requireAdminSession();
    const validated = upsertKnowledgeSourceSchema.parse(data);
    const sourceId = await adminService.upsertKnowledgeSource(validated, session.user.id);
    revalidatePath("/admin/knowledge");
    return { success: true, sourceId };
  } catch (error: any) {
    return { error: error.message || "Failed to save knowledge source" };
  }
}

export async function toggleKnowledgeSourceApprovalAction(id: string, approved: boolean) {
  try {
    const session = await requireAdminSession();
    const validated = toggleApprovalSchema.parse({ id, approved });
    await adminService.toggleKnowledgeSourceApproval(validated.id, validated.approved, session.user.id);
    revalidatePath("/admin/knowledge");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update approval status" };
  }
}

export async function getAlertRulesWithHistoryAction() {
  try {
    await requireAdminSession();
    const rules = await adminService.getAlertRulesWithHistory();
    return { success: true, rules };
  } catch (error: any) {
    return { error: error.message || "Failed to load alert rules" };
  }
}

export async function updateAlertRuleAction(ruleId: string, newValue: number) {
  try {
    const session = await requireAdminSession();
    const validated = updateAlertRuleSchema.parse({ ruleId, newValue });
    await adminService.updateAlertRule(
      validated.ruleId,
      validated.newValue,
      session.user.email || "admin@pankh.app"
    );
    revalidatePath("/admin/rules");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to update alert rule" };
  }
}

export async function getAiReviewQueueAction() {
  try {
    await requireAdminSession();
    const messages = await adminService.getAiReviewQueue();
    return { success: true, messages };
  } catch (error: any) {
    return { error: error.message || "Failed to load AI review queue" };
  }
}

export async function markAiMessageReviewedAction(
  messageId: string,
  status: "REVIEWED" | "FLAGGED_UNSAFE" | "DISMISSED",
  notes?: string
) {
  try {
    const session = await requireAdminSession();
    const validated = reviewAiMessageSchema.parse({ messageId, status, notes });
    await adminService.markAiMessageReviewed(
      validated.messageId,
      validated.status,
      validated.notes,
      session.user.id
    );
    revalidatePath("/admin/ai-review");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to record message review" };
  }
}

export async function getAggregatedEconomicsAnalyticsAction() {
  try {
    await requireAdminSession();
    const data = await adminService.getAggregatedEconomicsAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { error: error.message || "Failed to load economics analytics" };
  }
}

export async function getSystemAnalyticsAction() {
  try {
    await requireAdminSession();
    const data = await adminService.getSystemAnalytics();
    return { success: true, data };
  } catch (error: any) {
    return { error: error.message || "Failed to load system analytics" };
  }
}
