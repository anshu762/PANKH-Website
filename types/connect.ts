import { CaseRecord, CaseStatus, VetLab, VetLabType, Batch, Farmer, Alert, DailyHealthLog } from "@prisma/client";

export interface VetLabDistanceResult extends VetLab {
  distanceKm: number;
  durationMinutes: number;
  isWithinServiceRadius: boolean;
  matchScore: number;
  calculationMethod: "google_distance_matrix" | "haversine_formula";
}

export interface DailyTrendSummary {
  date: string;
  mortality: number;
  feedKg: number | null;
  waterLitres: number | null;
  eggCount: number | null;
  symptoms: string[];
  shedTemp: number | null;
}

export interface CaseSummaryPayload {
  caseId: string;
  farmer: {
    name: string | null;
    phone: string | null;
    district: string;
    tehsil: string | null;
    village: string | null;
  };
  batch: {
    id: string;
    name: string;
    type: string;
    breed: string;
    ageDays: number;
    currentBirds: number;
    startingBirds: number;
    livabilityPct: number;
  };
  trigger: {
    source: "SENTINEL_RED_ALERT" | "FARMER_REQUEST" | "AI_ESCALATION";
    alertReason?: string;
    signalsTriggered?: Record<string, unknown>;
  };
  symptoms: {
    farmerDescription: string;
    normalizedSymptoms: string[];
  };
  metricsTrend: DailyTrendSummary[];
  recentMediaUrls: string[];
  disclaimer: string;
  formattedWhatsAppText: string;
}

export interface SendCaseSummaryInput {
  caseId: string;
  vetLabId: string;
  consentGiven: boolean;
  channel?: "WHATSAPP" | "SMS";
}

export interface SendCaseSummaryResult {
  success: boolean;
  messageSid?: string;
  status: "READY" | "SENT" | "SIMULATED" | "FAILED";
  channel: "WHATSAPP" | "SMS";
  recipientPhone: string;
  whatsappUrl?: string;
  summaryText?: string;
  sandboxNotice?: string;
  error?: string;
}

export type CaseWithRelations = CaseRecord & {
  farmer: Farmer & { user?: { name: string | null; phone: string | null } | null };
  batch: Batch;
  alert: Alert | null;
  assignedVetLab: VetLab | null;
};
