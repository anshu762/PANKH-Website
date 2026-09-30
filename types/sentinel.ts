import { AlertSeverity, CaseStatus, ProductionType } from "@prisma/client";

export type AlertSeverityLevel = "GREEN" | "AMBER" | "RED";

export interface MetricBaseline {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  sampleCount: number;
}

export interface BatchBaseline {
  daysAvailable: number;
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  mortality: MetricBaseline | null;
  feedKg: MetricBaseline | null;
  waterLitres: MetricBaseline | null;
  eggCount: MetricBaseline | null;
  shedTemp: MetricBaseline | null;
}

export interface SentinelCheckinInput {
  mortality: number;
  feedKg?: number | null;
  feedUnit?: "KG" | "BAGS";
  waterLitres?: number | null;
  waterUnknown?: boolean;
  eggCount?: number | null;
  symptoms: string[];
  shedTemp?: number | null;
  notes?: string | null;
  mediaUrl?: string | null;
}

export interface RiskAssessmentSignals {
  [key: string]: any;
  mortalityRate: number;
  feedDeviationPercent?: number;
  waterDeviationPercent?: number;
  eggDeviationPercent?: number;
  shedTempDeviation?: number;
  hardRedFlag: boolean;
  redFlagReasons: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT";
  compositeScore: number;
  scoreBreakdown: Record<string, number>;
  ageInDays: number;
  ageBand: string;
}


export interface RiskAssessment {
  severity: AlertSeverityLevel;
  reasons: string[];
  recommendations: string[];
  signalsTriggered: RiskAssessmentSignals;
}

export interface AlertRuleMap {
  MORTALITY_RATE_WARNING: number;
  MORTALITY_RATE_CRITICAL: number;
  FEED_DROP_WARNING_PERCENT: number;
  FEED_DROP_CRITICAL_PERCENT: number;
  WATER_DROP_WARNING_PERCENT: number;
  WATER_DROP_CRITICAL_PERCENT: number;
  EGG_DROP_WARNING_PERCENT: number;
  EGG_DROP_CRITICAL_PERCENT: number;
  SHED_TEMP_HIGH_CELSIUS: number;
  SHED_TEMP_CRITICAL_CELSIUS: number;
  WEIGHT_MORTALITY: number;
  WEIGHT_WATER: number;
  WEIGHT_FEED: number;
  WEIGHT_SYMPTOMS: number;
  WEIGHT_ENVIRONMENT: number;
  RISK_SCORE_AMBER_THRESHOLD: number;
  RISK_SCORE_RED_THRESHOLD: number;
  [key: string]: number;
}

export type FarmerActionType = "RESOLVED" | "STILL_HAPPENING" | "VET_CONTACTED";

export interface FarmerActionSubmission {
  alertId: string;
  action: FarmerActionType;
  notes?: string;
}

export interface SentinelDashboardData {
  farmer: any;
  farm: any;
  batch: any;
  todayLog: any | null;
  latestAlert: any | null;
  recentLogs: any[];
  recentAlerts: any[];
  baseline: BatchBaseline;
  latestRisk?: RiskAssessment | null;
  lastCheckinTime?: string | null;
  isCheckedInToday: boolean;
}
