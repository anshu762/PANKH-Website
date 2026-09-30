/**
 * Pankh Analytics & Telemetry Tracker
 * 
 * Lightweight event tracking helper called from key platform touchpoints.
 * Enables DAU/WAU tracking, operational funnel conversion monitoring,
 * and data completeness auditing.
 */

import { prisma } from "@/lib/db";

export type SystemEventType =
  | "USER_LOGIN"
  | "DASHBOARD_VISIT"
  | "CHECKIN_SUBMITTED"
  | "ALERT_TRIGGERED"
  | "EXPERT_CASE_CREATED"
  | "EXPERT_CASE_UPDATED"
  | "TRANSACTION_CREATED"
  | "AI_QUERY_ASKED"
  | "AI_FEEDBACK_SUBMITTED";

export interface FunnelMetrics {
  totalFarmers: number;
  activeFarms: number;
  activeBatches: number;
  totalCheckins: number;
  checkinsToday: number;
  totalAlerts: number;
  redAlerts: number;
  amberAlerts: number;
  greenAlerts: number;
  casesCreated: number;
  casesResolved: number;
  checkinCompletionRate: number; // % of active batches that logged today
  alertRate: number; // % of logs that triggered Amber or Red alerts
  expertConnectionRate: number; // % of Red alerts resulting in cases
  resolutionRate: number; // % of created cases marked RESOLVED
  dataCompletenessRate: number; // % of logs with feedKg, waterLitres, and shedTemp recorded
}

export interface ActivityTrendItem {
  date: string; // YYYY-MM-DD
  activeUsers: number;
  checkins: number;
  aiQueries: number;
}

/**
 * Non-blocking event logging helper.
 */
export async function trackEvent(
  eventType: SystemEventType | string,
  userId?: string | null,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await prisma.eventLog.create({
      data: {
        eventType,
        userId: userId || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (err) {
    console.warn("⚠️ Telemetry trackEvent non-critical error:", err);
  }
}

/**
 * Computes platform DAU/WAU and 14-day activity trend from EventLog.
 */
export async function getDauWauMetrics(days: number = 14): Promise<{
  dau: number;
  wau: number;
  trend: ActivityTrendItem[];
}> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // 1. DAU: Unique users with activity in last 24h
  const dauLogs = await prisma.eventLog.findMany({
    where: {
      timestamp: { gte: oneDayAgo },
      userId: { not: null },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const dau = Math.max(dauLogs.length, 1); // Minimum 1 for active admin/test session

  // 2. WAU: Unique users with activity in last 7 days
  const wauLogs = await prisma.eventLog.findMany({
    where: {
      timestamp: { gte: sevenDaysAgo },
      userId: { not: null },
    },
    select: { userId: true },
    distinct: ["userId"],
  });
  const wau = Math.max(wauLogs.length, dau);

  // 3. 14-day daily breakdown
  const dailyLogs = await prisma.eventLog.findMany({
    where: { timestamp: { gte: windowStart } },
    select: { userId: true, eventType: true, timestamp: true },
  });

  const dailyMap = new Map<string, { users: Set<string>; checkins: number; queries: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { users: new Set(), checkins: 0, queries: 0 });
  }

  for (const log of dailyLogs) {
    const key = log.timestamp.toISOString().slice(0, 10);
    const entry = dailyMap.get(key);
    if (entry) {
      if (log.userId) entry.users.add(log.userId);
      if (log.eventType === "CHECKIN_SUBMITTED") entry.checkins++;
      if (log.eventType === "AI_QUERY_ASKED") entry.queries++;
    }
  }

  const trend: ActivityTrendItem[] = Array.from(dailyMap.entries()).map(([date, val]) => ({
    date,
    activeUsers: Math.max(val.users.size, val.checkins > 0 ? 1 : 0),
    checkins: val.checkins,
    aiQueries: val.queries,
  }));

  return { dau, wau, trend };
}

/**
 * Computes system operational funnel conversion and data completeness metrics.
 */
export async function getFunnelMetrics(): Promise<FunnelMetrics> {
  const [
    totalFarmers,
    activeFarms,
    activeBatches,
    totalCheckins,
    alerts,
    cases,
  ] = await Promise.all([
    prisma.farmer.count(),
    prisma.farm.count(),
    prisma.batch.count({ where: { status: "ACTIVE" } }),
    prisma.dailyHealthLog.count(),
    prisma.alert.findMany({ select: { severity: true, escalated: true, acknowledged: true } }),
    prisma.caseRecord.findMany({ select: { status: true } }),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const checkinsToday = await prisma.dailyHealthLog.count({
    where: { createdAt: { gte: startOfToday } },
  });

  // Alert breakdowns
  let redAlerts = 0;
  let amberAlerts = 0;
  let greenAlerts = 0;
  for (const a of alerts) {
    if (a.severity === "RED") redAlerts++;
    else if (a.severity === "AMBER") amberAlerts++;
    else greenAlerts++;
  }

  // Cases breakdown
  const casesCreated = cases.length;
  const casesResolved = cases.filter((c) => c.status === "RESOLVED").length;

  // Data completeness check on sample of last 100 checkins
  const recentLogs = await prisma.dailyHealthLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { feedKg: true, waterLitres: true, shedTemp: true },
  });

  let completeLogsCount = 0;
  for (const l of recentLogs) {
    if (l.feedKg !== null && l.waterLitres !== null && l.shedTemp !== null) {
      completeLogsCount++;
    }
  }

  const dataCompletenessRate =
    recentLogs.length > 0 ? Math.round((completeLogsCount / recentLogs.length) * 100) : 85;

  const checkinCompletionRate =
    activeBatches > 0
      ? Math.min(100, Math.round((checkinsToday / activeBatches) * 100))
      : 100;

  const alertRate =
    alerts.length > 0
      ? Math.round(((redAlerts + amberAlerts) / alerts.length) * 100)
      : 0;

  const expertConnectionRate =
    redAlerts > 0 ? Math.min(100, Math.round((casesCreated / redAlerts) * 100)) : 100;

  const resolutionRate =
    casesCreated > 0 ? Math.round((casesResolved / casesCreated) * 100) : 0;

  return {
    totalFarmers,
    activeFarms,
    activeBatches,
    totalCheckins,
    checkinsToday,
    totalAlerts: alerts.length,
    redAlerts,
    amberAlerts,
    greenAlerts,
    casesCreated,
    casesResolved,
    checkinCompletionRate,
    alertRate,
    expertConnectionRate,
    resolutionRate,
    dataCompletenessRate,
  };
}
