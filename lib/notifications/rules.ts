import { prisma } from "@/lib/db";
import { dispatchNotification, DispatchResult } from "./dispatcher";
import { CaseStatus, ProductionType } from "@prisma/client";
import { generateDeterministicInsights } from "@/lib/economics/insights";
import { buildBatchEconomicsReport } from "@/lib/economics/calculations";

/**
 * Section 7.3 Notification Policy Rules
 */

/**
 * 1. Daily Check-in Reminder
 * Dispatches one push-style in-app notification and an optional WhatsApp reminder
 * if the farmer has not submitted today's health check-in. Non-spammy: max 1 per day.
 */
export async function evaluateDailyCheckinReminder(
  farmerId: string,
  batchId: string
): Promise<DispatchResult | null> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Check if today's check-in already logged
  const existingLog = await prisma.dailyHealthLog.findFirst({
    where: {
      batchId,
      OR: [
        { createdAt: { gte: startOfDay } },
        { date: { gte: startOfDay } },
      ],
    },
  });

  if (existingLog) {
    return null; // Already completed today!
  }

  // Check if a reminder was already sent today
  const reminderAlreadySent = await prisma.notification.findFirst({
    where: {
      farmerId,
      type: "CHECKIN_REMINDER",
      createdAt: { gte: startOfDay },
    },
  });

  if (reminderAlreadySent) {
    return null; // Already reminded today
  }

  const farmer = await prisma.farmer.findUnique({
    where: { id: farmerId },
    select: { consentDataShare: true },
  });

  return await dispatchNotification({
    farmerId,
    type: "CHECKIN_REMINDER",
    title: "Daily Flock Check-in Due | ਰੋਜ਼ਾਨਾ ਚੈੱਕ-ਇਨ",
    body: "Please record today's flock mortality, feed intake, and shed temperature in under 60 seconds to maintain your flock health surveillance.",
    severity: "WARNING",
    linkUrl: "/dashboard/sentinel/checkin",
    sendWhatsApp: Boolean(farmer?.consentDataShare),
    allowSmsFallback: false,
    metadata: { batchId },
  });
}

/**
 * 2. AMBER Alert
 * In-app notification only. External channel muted to avoid alarm fatigue.
 */
export async function evaluateAmberAlertNotification(
  farmerId: string,
  alertId: string,
  reason: string,
  metrics?: Record<string, any>
): Promise<DispatchResult> {
  return await dispatchNotification({
    farmerId,
    type: "AMBER_ALERT",
    title: "Sentinel Notice: Moderate Flock Deviation | ਚੌਕਸੀ ਨੋਟਿਸ",
    body: reason || "Flock consumption or mortality metrics have deviated moderately from your 7-day baseline.",
    severity: "WARNING",
    linkUrl: "/dashboard/sentinel",
    sendWhatsApp: false, // In-app only per brief
    allowSmsFallback: false,
    metadata: { alertId, metrics },
  });
}

/**
 * 3. RED Alert
 * Urgent In-app notification + immediate WhatsApp dispatch (with SMS fallback).
 */
export async function evaluateRedAlertNotification(
  farmerId: string,
  alertId: string,
  reason: string,
  signals?: Record<string, any>
): Promise<DispatchResult> {
  return await dispatchNotification({
    farmerId,
    type: "RED_ALERT",
    title: "URGENT HEALTH ALERT: Action Required | ਜ਼ਰੂਰੀ ਚਿਤਾਵਨੀ",
    body: `CRITICAL RISK DETECTED: ${reason}. Rapid triage recommended. An escalation record has been prepared. Please review immediately.`,
    severity: "CRITICAL",
    linkUrl: "/dashboard/sentinel",
    sendWhatsApp: true,
    allowSmsFallback: true,
    metadata: { alertId, signals },
  });
}

/**
 * 4. Vet Case Status Update
 * In-app notification + WhatsApp status dispatch.
 */
export async function evaluateCaseStatusNotification(
  farmerId: string,
  caseId: string,
  status: CaseStatus,
  vetName?: string
): Promise<DispatchResult> {
  const statusLabels: Record<CaseStatus, string> = {
    CREATED: "Case Initiated",
    CONTACTED: "Shared with Veterinary Expert",
    APPOINTMENT: "Teleconsult Scheduled",
    ADVICE_RECEIVED: "Clinical Advice Received",
    RESOLVED: "Flock Health Case Resolved",
  };

  const label = statusLabels[status] || status;
  const vetInfo = vetName ? ` by ${vetName}` : "";

  return await dispatchNotification({
    farmerId,
    type: "CASE_UPDATE",
    title: `Veterinary Case Update: ${label}`,
    body: `Your escalation case status has been updated to "${label}"${vetInfo}. Tap to view clinical recommendations.`,
    severity: status === "RESOLVED" ? "INFO" : "WARNING",
    linkUrl: `/dashboard/connect/${caseId}`,
    sendWhatsApp: true,
    allowSmsFallback: false,
    metadata: { caseId, status },
  });
}

/**
 * 5. Vaccination Reminder
 * Compares current flock age in days against admin-managed VaccinationSchedule.
 * If flock is due for a scheduled vaccine today, dispatches WhatsApp + in-app notification.
 */
export async function evaluateVaccinationSchedule(
  farmerId: string,
  batchId: string
): Promise<DispatchResult | null> {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch || !batch.placementDate) return null;

  // Calculate current flock age in days
  const placed = new Date(batch.placementDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24));
  const flockDay = Math.max(1, diffDays + 1);

  // Check matching schedule items
  const scheduledItem = await prisma.vaccinationSchedule.findFirst({
    where: {
      productionType: batch.productionType,
      dayDue: flockDay,
    },
  });

  if (!scheduledItem) return null;

  // Ensure we haven't already notified for this batch and day
  const alreadyNotified = await prisma.notification.findFirst({
    where: {
      farmerId,
      type: "VACCINATION_DUE",
      metadata: {
        path: ["flockDay"],
        equals: flockDay,
      },
    },
  });

  if (alreadyNotified) return null;

  return await dispatchNotification({
    farmerId,
    type: "VACCINATION_DUE",
    title: `Vaccination Alert: Flock Day ${flockDay} Due | ਟੀਕਾਕਰਨ ਚਿਤਾਵਨੀ`,
    body: `Flock Day ${flockDay}: Due for ${scheduledItem.vaccineName} (${scheduledItem.diseaseTarget}) via ${scheduledItem.route}. ${scheduledItem.notes || ""}`,
    severity: "INFO",
    linkUrl: "/dashboard/sentinel",
    sendWhatsApp: true,
    allowSmsFallback: false,
    metadata: {
      batchId,
      flockDay,
      vaccineId: scheduledItem.id,
      vaccineName: scheduledItem.vaccineName,
    },
  });
}

/**
 * 6. Weekly Economics Insight
 * Generates one in-app notification per week summarizing the top economic insight.
 */
export async function evaluateWeeklyEconomicsNotification(
  farmerId: string,
  batchId: string
): Promise<DispatchResult | null> {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const existingWeekly = await prisma.notification.findFirst({
    where: {
      farmerId,
      type: "WEEKLY_ECONOMICS",
      createdAt: { gte: oneWeekAgo },
    },
  });

  if (existingWeekly) return null;

  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
  });

  if (!batch) return null;

  const transactions = await prisma.transaction.findMany({
    where: { batchId },
  });

  const logs = await prisma.dailyHealthLog.findMany({
    where: { batchId },
    orderBy: { date: "desc" },
    take: 14,
  });

  const report = buildBatchEconomicsReport(batch, transactions, logs);
  const insights = generateDeterministicInsights(report);

  const topInsight = insights[0];
  if (!topInsight) return null;

  return await dispatchNotification({
    farmerId,
    type: "WEEKLY_ECONOMICS",
    title: `Weekly Flock Economics Insight | ਹਫ਼ਤਾਵਾਰੀ ਖ਼ਰਚਾ ਸਮੀਖਿਆ`,
    body: `${topInsight.headline}: ${topInsight.body}`,
    severity: topInsight.severity === "warning" || topInsight.severity === "urgent" ? "WARNING" : "INFO",
    linkUrl: "/dashboard/economics",
    sendWhatsApp: false, // In-app notification per brief
    allowSmsFallback: false,
    metadata: { batchId, metric: topInsight.headline },
  });
}
