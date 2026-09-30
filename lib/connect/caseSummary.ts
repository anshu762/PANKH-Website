import { CaseSummaryPayload, DailyTrendSummary } from "@/types/connect";

export const MANDATORY_CASE_DISCLAIMER =
  "⚠️ DISCLAIMER: AI-prepared case summary; not a confirmed veterinary diagnosis. Provided to assist licensed veterinarians and diagnostic laboratories.";

export interface GenerateCaseSummaryParams {
  caseId: string;
  farmer: {
    name: string | null;
    phone: string | null;
    district: string;
    tehsil?: string | null;
    village?: string | null;
  };
  batch: {
    id: string;
    name: string;
    productionType: string;
    breed: string;
    placedDate: Date | string;
    currentBirds: number;
    startingBirds: number;
  };
  symptomsDescription: string;
  normalizedSymptoms: string[];
  recentLogs: Array<{
    date: Date | string;
    mortality: number;
    feedKg: number | null;
    waterLitres: number | null;
    eggCount: number | null;
    shedTemp: number | null;
    symptoms: string[];
  }>;
  alert?: {
    severity: string;
    reason: string;
    signalsTriggered?: unknown;
  } | null;
  mediaUrls?: string[];
}

/**
 * Calculates flock age in days from placed date.
 */
export function calculateFlockAgeDays(placedDate: Date | string): number {
  const placed = new Date(placedDate);
  const now = new Date();
  const diffTime = Math.max(0, now.getTime() - placed.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Calculates flock livability percentage.
 */
export function calculateLivabilityPct(currentBirds: number, startingBirds: number): number {
  if (startingBirds <= 0) return 0;
  return Math.round(((currentBirds / startingBirds) * 100) * 10) / 10;
}

/**
 * Generates both structured JSON and a WhatsApp-formatted text summary.
 */
export function generateCaseSummary(params: GenerateCaseSummaryParams): CaseSummaryPayload {
  const {
    caseId,
    farmer,
    batch,
    symptomsDescription,
    normalizedSymptoms,
    recentLogs,
    alert,
    mediaUrls = [],
  } = params;

  const ageDays = calculateFlockAgeDays(batch.placedDate);
  const livabilityPct = calculateLivabilityPct(batch.currentBirds, batch.startingBirds);

  // Sort logs chronological (oldest to newest for trend)
  const sortedLogs = [...recentLogs].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const metricsTrend: DailyTrendSummary[] = sortedLogs.slice(-7).map((log) => {
    const d = new Date(log.date);
    const dateFormatted = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      timeZone: "Asia/Kolkata",
    });
    return {
      date: dateFormatted,
      mortality: log.mortality,
      feedKg: log.feedKg !== null ? Math.round(log.feedKg * 10) / 10 : null,
      waterLitres: log.waterLitres !== null ? Math.round(log.waterLitres * 10) / 10 : null,
      eggCount: log.eggCount ?? null,
      symptoms: log.symptoms,
      shedTemp: log.shedTemp !== null ? Math.round(log.shedTemp * 10) / 10 : null,
    };
  });

  const source = alert ? "SENTINEL_RED_ALERT" : "FARMER_REQUEST";

  // Build WhatsApp text representation
  const lines: string[] = [];

  lines.push("📋 *PANKH VET ESCALATION SUMMARY*");
  lines.push(`_Case ID: ${caseId.slice(-8).toUpperCase()}_`);
  lines.push("");

  // Farmer & Farm Details
  lines.push("👤 *Farmer & Farm Details:*");
  lines.push(`• Name: ${farmer.name || "Poultry Farmer"}`);
  lines.push(`• Contact: ${farmer.phone || "Not recorded"}`);
  const locationParts = [farmer.village, farmer.tehsil, farmer.district].filter(Boolean);
  lines.push(`• Location: ${locationParts.length > 0 ? locationParts.join(", ") : farmer.district}, Punjab`);
  lines.push("");

  // Flock & Batch Overview
  lines.push("🐔 *Flock Overview:*");
  lines.push(`• Batch: ${batch.name} (${batch.productionType} - ${batch.breed})`);
  lines.push(`• Flock Age: Day ${ageDays}`);
  lines.push(
    `• Population: ${batch.currentBirds.toLocaleString("en-IN")} / ${batch.startingBirds.toLocaleString("en-IN")} birds (${livabilityPct}% livability)`
  );
  lines.push("");

  // Escalation Reason / Trigger
  if (alert) {
    lines.push("🚨 *Sentinel Alert Trigger:*");
    lines.push(`• Severity: ${alert.severity}`);
    lines.push(`• Alert Reason: ${alert.reason}`);
    lines.push("");
  }

  // Symptoms
  lines.push("🩺 *Reported Symptoms & Observations:*");
  lines.push(`• Farmer Description: "${symptomsDescription || "Sudden health decline observed"}"`);
  if (normalizedSymptoms.length > 0) {
    lines.push(`• Key Observed Signals: ${normalizedSymptoms.join(", ")}`);
  }
  lines.push("");

  // 3 to 7 Day Metrics Trend
  if (metricsTrend.length > 0) {
    lines.push("📈 *Recent Daily Trend (Date | Mort | Feed | Water):*");
    for (const log of metricsTrend) {
      const feedStr = log.feedKg !== null ? `${log.feedKg}kg` : "—";
      const waterStr = log.waterLitres !== null ? `${log.waterLitres}L` : "—";
      const mortStr = `${log.mortality} dead`;
      const tempStr = log.shedTemp !== null ? ` | ${log.shedTemp}°C` : "";
      lines.push(`• ${log.date}: ${mortStr} | Feed: ${feedStr} | Water: ${waterStr}${tempStr}`);
    }
    lines.push("");
  }

  // Media
  if (mediaUrls.length > 0) {
    lines.push("📷 *Attached Photos/Media:*");
    mediaUrls.forEach((url, i) => lines.push(`• Photo ${i + 1}: ${url}`));
    lines.push("");
  }

  // Mandatory non-diagnosis disclaimer
  lines.push("━━━━━━━━━━━━━━━━━━━━");
  lines.push(`*${MANDATORY_CASE_DISCLAIMER}*`);

  const formattedWhatsAppText = lines.join("\n");

  return {
    caseId,
    farmer: {
      name: farmer.name,
      phone: farmer.phone,
      district: farmer.district,
      tehsil: farmer.tehsil ?? null,
      village: farmer.village ?? null,
    },
    batch: {
      id: batch.id,
      name: batch.name,
      type: batch.productionType,
      breed: batch.breed,
      ageDays,
      currentBirds: batch.currentBirds,
      startingBirds: batch.startingBirds,
      livabilityPct,
    },
    trigger: {
      source,
      alertReason: alert?.reason,
      signalsTriggered:
        alert?.signalsTriggered && typeof alert.signalsTriggered === "object"
          ? (alert.signalsTriggered as Record<string, unknown>)
          : undefined,
    },
    symptoms: {
      farmerDescription: symptomsDescription,
      normalizedSymptoms,
    },
    metricsTrend,
    recentMediaUrls: mediaUrls,
    disclaimer: MANDATORY_CASE_DISCLAIMER,
    formattedWhatsAppText,
  };
}
