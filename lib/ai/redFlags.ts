/**
 * Pankh AI — Deterministic Red-Flag Rules Layer
 * 
 * HARD RULE #3: Health/veterinary answers must pass through this deterministic
 * red-flag rules layer BEFORE calling the LLM for generation.
 * If triggered, escalation is forced regardless of what the LLM would say.
 */

import {
  RedFlagCheckInput,
  RedFlagSignals,
  RedFlagResult,
} from "@/types/ai";
import {
  MORTALITY_PATTERNS,
  NEUROLOGICAL_PATTERNS,
  SEVERE_RESPIRATORY_PATTERNS,
  WATER_DROP_PATTERNS,
  SYMPTOM_CLUSTERS,
} from "@/constants/ai";

export type { RedFlagCheckInput, RedFlagSignals, RedFlagResult };

/**
 * Pure deterministic function to check for veterinary emergency red flags.
 * Operates independently of any LLM and guarantees immediate escalation triggers.
 */
export function checkRedFlags(input: RedFlagCheckInput): RedFlagResult {
  const text = (input.text || "").toLowerCase();
  const explicitSymptoms = (input.symptoms || []).map((s) => s.toLowerCase());
  const combinedText = `${text} ${explicitSymptoms.join(" ")}`;

  const reasons: string[] = [];
  const signals: RedFlagSignals = {
    mortalitySpike: false,
    neurologicalSigns: false,
    severeRespiratory: false,
    waterIntakeDrop: false,
    rapidMultiSymptom: false,
  };

  // 1. Mortality Spike Check
  let hasMortalitySpike = false;
  if (input.mortalityPercent && input.mortalityPercent >= 1.0) {
    hasMortalitySpike = true;
    reasons.push(
      `Mortality rate (${input.mortalityPercent.toFixed(1)}%) exceeds critical threshold of 1.0%/day`
    );
  } else if (input.flockSize && input.mortalityCount) {
    const calcRate = (input.mortalityCount / input.flockSize) * 100;
    if (calcRate >= 1.0) {
      hasMortalitySpike = true;
      reasons.push(
        `Daily flock mortality (${input.mortalityCount}/${input.flockSize} = ${calcRate.toFixed(1)}%) exceeds 1.0% limit`
      );
    } else if (input.mortalityCount >= 20) {
      hasMortalitySpike = true;
      reasons.push(`Absolute mortality count (${input.mortalityCount} birds) signals urgent flock crisis`);
    }
  }

  // Keyword check for mortality
  if (!hasMortalitySpike) {
    for (const pattern of MORTALITY_PATTERNS) {
      if (pattern.test(combinedText)) {
        hasMortalitySpike = true;
        reasons.push("Severe sudden flock mortality spike reported in query");
        break;
      }
    }
  }
  signals.mortalitySpike = hasMortalitySpike;

  // 2. Neurological Signs Check
  let hasNeurological = false;
  for (const pattern of NEUROLOGICAL_PATTERNS) {
    if (pattern.test(combinedText)) {
      hasNeurological = true;
      reasons.push("Acute neurological indicators detected (torticollis, star-gazing, ataxia, or paralysis)");
      break;
    }
  }
  signals.neurologicalSigns = hasNeurological;

  // 3. Severe Respiratory Distress Check
  let hasSevereRespiratory = false;
  for (const pattern of SEVERE_RESPIRATORY_PATTERNS) {
    if (pattern.test(combinedText)) {
      hasSevereRespiratory = true;
      reasons.push(
        "Severe respiratory distress detected (acute gasping, tracheal rales, cyanotic comb, or hemoptysis)"
      );
      break;
    }
  }
  signals.severeRespiratory = hasSevereRespiratory;

  // 4. Low Water Intake Check
  let hasWaterDrop = false;
  if (input.waterDropPercent && input.waterDropPercent >= 25.0) {
    hasWaterDrop = true;
    reasons.push(`Sudden water intake plunge of ${input.waterDropPercent.toFixed(0)}% (threshold 25%)`);
  } else {
    for (const pattern of WATER_DROP_PATTERNS) {
      if (pattern.test(combinedText)) {
        hasWaterDrop = true;
        reasons.push("Critical flock water refusal reported");
        break;
      }
    }
  }
  signals.waterIntakeDrop = hasWaterDrop;

  // 5. Rapid Multi-Symptom Deterioration Check (3+ symptom categories present)
  let categoriesDetected = 0;
  for (const [, keywords] of Object.entries(SYMPTOM_CLUSTERS)) {
    const matched = keywords.some((kw) => combinedText.includes(kw));
    if (matched) {
      categoriesDetected++;
    }
  }

  if (categoriesDetected >= 3) {
    signals.rapidMultiSymptom = true;
    reasons.push(`Rapid multi-system deterioration: ${categoriesDetected} concurrent symptom clusters reported`);
  }

  // Trigger evaluation
  const triggered =
    signals.mortalitySpike ||
    signals.neurologicalSigns ||
    signals.severeRespiratory ||
    signals.waterIntakeDrop ||
    signals.rapidMultiSymptom;

  let urgencyLevel: "CRITICAL" | "HIGH" | "NONE" = "NONE";
  if (signals.mortalitySpike || signals.neurologicalSigns || signals.severeRespiratory) {
    urgencyLevel = "CRITICAL";
  } else if (triggered) {
    urgencyLevel = "HIGH";
  }

  return {
    triggered,
    urgencyLevel,
    reasons,
    signals,
  };
}
