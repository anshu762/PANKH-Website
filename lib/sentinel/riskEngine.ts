import { BatchBaseline, RiskAssessment, SentinelCheckinInput, AlertRuleMap } from "@/types/sentinel";
import { DEFAULT_ALERT_RULES } from "./rules";
import { checkRedFlags } from "@/lib/ai/redFlags";

/**
 * Broiler age bands and consumption velocity multipliers.
 *
 * NOTE & CAVEAT: Broiler feed and water intake scale rapidly with age in days.
 * For Cobb 500 / Ross 308 birds, day-over-day consumption accelerates through
 * the brooding, starter, and grower stages.
 *
 * As noted in the project brief: these age-banded multipliers and deviation thresholds
 * are modeled for the MVP reference curve and require formal validation by registered
 * poultry veterinarians and GADVASU poultry nutrition specialists.
 */
interface AgeBandConfig {
  bandName: string;
  minAge: number;
  maxAge: number;
  dailyIntakeGrowthFactor: number; // Approximate daily expected expansion rate vs 7d trailing median
  waterSensitivityFactor: number; // Sensitivity multiplier for sudden drop
  tempToleranceMax: number; // Upper shed comfort limit (°C)
}

const BROILER_AGE_BANDS: AgeBandConfig[] = [
  {
    bandName: "Brooding Stage (Day 1-7)",
    minAge: 1,
    maxAge: 7,
    dailyIntakeGrowthFactor: 1.15,
    waterSensitivityFactor: 1.0,
    tempToleranceMax: 33.0,
  },
  {
    bandName: "Starter / Early Grower (Day 8-21)",
    minAge: 8,
    maxAge: 21,
    dailyIntakeGrowthFactor: 1.08,
    waterSensitivityFactor: 1.2,
    tempToleranceMax: 30.0,
  },
  {
    bandName: "Grower / Finisher (Day 22-35)",
    minAge: 22,
    maxAge: 35,
    dailyIntakeGrowthFactor: 1.04,
    waterSensitivityFactor: 1.4,
    tempToleranceMax: 27.0,
  },
  {
    bandName: "Late Finisher / Market Ready (Day 36+)",
    minAge: 36,
    maxAge: 999,
    dailyIntakeGrowthFactor: 1.01,
    waterSensitivityFactor: 1.5,
    tempToleranceMax: 25.0,
  },
];

function getAgeBand(ageInDays: number): AgeBandConfig {
  const band = BROILER_AGE_BANDS.find(
    (b) => ageInDays >= b.minAge && ageInDays <= b.maxAge
  );
  return band || BROILER_AGE_BANDS[BROILER_AGE_BANDS.length - 1];
}

/**
 * Pure function to calculate disease-risk severity, comparative deviation metrics,
 * and immediate farmer recommendations.
 *
 * Adheres strictly to Hard Rule #1: NEVER claims a confirmed disease diagnosis.
 * Describes symptom patterns, classifies risk into NORMAL/WATCH/URGENT, and recommends
 * veterinary consultation where appropriate.
 */
export function calculateRisk(
  log: SentinelCheckinInput,
  baseline: BatchBaseline,
  batch: {
    startingBirds: number;
    currentBirds: number;
    productionType: "BROILER" | "LAYER" | string;
    placementDate?: Date | string;
  },
  rules: AlertRuleMap = DEFAULT_ALERT_RULES,
  weather?: {
    temp: number;
    humidity: number;
    thi?: number;
    heatRisk?: string;
  }
): RiskAssessment {
  const currentBirds = Math.max(1, batch.currentBirds);
  const reasons: string[] = [];
  const scoreBreakdown: Record<string, number> = {};

  // 1. Calculate flock age in days
  let ageInDays = 21; // fallback
  if (batch.placementDate) {
    const placed = new Date(batch.placementDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24));
    ageInDays = Math.max(1, diff + 1);
  }
  const ageBand = getAgeBand(ageInDays);

  // 2. Hard Red-Flag Symptom Layer Check (Reuse checkRedFlags from Phase 3)
  // Sudden mortality spike, torticollis/neuro, severe gasping, water refusal
  const redFlagInput = {
    text: log.notes || "",
    symptoms: log.symptoms,
    flockSize: currentBirds,
    mortalityCount: log.mortality,
    mortalityPercent: (log.mortality / currentBirds) * 100,
  };
  const redFlags = checkRedFlags(redFlagInput);

  // 3. Metric Deviations
  // A. Mortality Rate
  const mortalityRate = (log.mortality / currentBirds) * 100;
  let mortalityPoints = 0;
  if (mortalityRate >= rules.MORTALITY_RATE_CRITICAL) {
    mortalityPoints = 100;
    reasons.push(
      `Daily mortality spike: ${log.mortality} birds (${mortalityRate.toFixed(1)}% of flock, exceeds urgent threshold of ${rules.MORTALITY_RATE_CRITICAL}%)`
    );
  } else if (mortalityRate >= rules.MORTALITY_RATE_WARNING) {
    mortalityPoints = 50;
    reasons.push(
      `Elevated mortality: ${log.mortality} birds (${mortalityRate.toFixed(1)}% of flock, warning threshold ${rules.MORTALITY_RATE_WARNING}%)`
    );
  } else if (baseline.mortality && baseline.mortality.median > 0 && log.mortality >= baseline.mortality.median * 2.5) {
    mortalityPoints = 40;
    reasons.push(
      `Mortality jumped to ${log.mortality} birds (more than 2.5x your 7-day normal of ${baseline.mortality.median.toFixed(0)}/day)`
    );
  }
  scoreBreakdown.mortality = mortalityPoints;

  // B. Water Intake Drop
  let waterDeviationPercent: number | undefined;
  let waterPoints = 0;
  let activeWaterWeight = rules.WEIGHT_WATER;

  if (log.waterUnknown || log.waterLitres === null || log.waterLitres === undefined) {
    // Missing water does NOT automatically produce RED. Excluded from active denominator.
    activeWaterWeight = 0;
  } else if (baseline.waterLitres && baseline.waterLitres.median > 0) {
    // Expected water adjusted for age growth
    const expectedWater = baseline.waterLitres.median * (batch.productionType === "BROILER" ? ageBand.dailyIntakeGrowthFactor : 1.0);
    if (log.waterLitres < expectedWater) {
      waterDeviationPercent = Number(
        (((expectedWater - log.waterLitres) / expectedWater) * 100).toFixed(1)
      );

      if (waterDeviationPercent >= rules.WATER_DROP_CRITICAL_PERCENT) {
        waterPoints = 100;
        reasons.push(
          `Water intake down ${waterDeviationPercent}% vs expected intake (${log.waterLitres}L vs ${Math.round(expectedWater)}L expected for ${ageBand.bandName})`
        );
      } else if (waterDeviationPercent >= rules.WATER_DROP_WARNING_PERCENT) {
        waterPoints = 50;
        reasons.push(
          `Water intake dropped ${waterDeviationPercent}% vs 7-day normal (${log.waterLitres}L vs ${baseline.waterLitres.median}L median)`
        );
      }
    }
  }
  scoreBreakdown.water = waterPoints;

  // C. Feed Intake Drop
  let feedDeviationPercent: number | undefined;
  let feedPoints = 0;
  let activeFeedWeight = rules.WEIGHT_FEED;

  if (log.feedKg === null || log.feedKg === undefined) {
    activeFeedWeight = 0;
  } else if (baseline.feedKg && baseline.feedKg.median > 0) {
    const expectedFeed = baseline.feedKg.median * (batch.productionType === "BROILER" ? ageBand.dailyIntakeGrowthFactor : 1.0);
    if (log.feedKg < expectedFeed) {
      feedDeviationPercent = Number(
        (((expectedFeed - log.feedKg) / expectedFeed) * 100).toFixed(1)
      );

      if (feedDeviationPercent >= rules.FEED_DROP_CRITICAL_PERCENT) {
        feedPoints = 100;
        reasons.push(
          `Feed consumption plunged ${feedDeviationPercent}% below expected standard (${log.feedKg} kg vs ${Math.round(expectedFeed)} kg)`
        );
      } else if (feedDeviationPercent >= rules.FEED_DROP_WARNING_PERCENT) {
        feedPoints = 50;
        reasons.push(
          `Feed consumption down ${feedDeviationPercent}% vs 7-day normal (${log.feedKg} kg vs ${baseline.feedKg.median} kg)`
        );
      }
    }
  }
  scoreBreakdown.feed = feedPoints;

  // D. Egg Drop (Layers only)
  let eggDeviationPercent: number | undefined;
  let eggPoints = 0;
  let activeEggWeight = 0;

  if (batch.productionType === "LAYER" && baseline.eggCount && baseline.eggCount.median > 0 && typeof log.eggCount === "number") {
    activeEggWeight = 15;
    if (log.eggCount < baseline.eggCount.median) {
      eggDeviationPercent = Number(
        (((baseline.eggCount.median - log.eggCount) / baseline.eggCount.median) * 100).toFixed(1)
      );
      if (eggDeviationPercent >= rules.EGG_DROP_CRITICAL_PERCENT) {
        eggPoints = 100;
        reasons.push(
          `Egg production dropped ${eggDeviationPercent}% (${log.eggCount} eggs vs ${baseline.eggCount.median} daily normal)`
        );
      } else if (eggDeviationPercent >= rules.EGG_DROP_WARNING_PERCENT) {
        eggPoints = 50;
        reasons.push(
          `Egg production decreased ${eggDeviationPercent}% vs 7-day normal`
        );
      }
    }
  }
  scoreBreakdown.eggs = eggPoints;

  // E. Symptoms Severity
  let symptomPoints = 0;
  const symptoms = log.symptoms || [];
  const highRiskSymptoms = ["unusual deaths", "sudden mortality", "star gazing", "paralysis"];
  const moderateSymptoms = ["cough/sneeze", "loose droppings", "sleepy birds", "reduced appetite", "weakness"];

  const hasHighRiskSym = symptoms.some((s) =>
    highRiskSymptoms.some((hr) => s.toLowerCase().includes(hr))
  );
  const matchedModCount = symptoms.filter((s) =>
    moderateSymptoms.some((m) => s.toLowerCase().includes(m))
  ).length;

  if (hasHighRiskSym) {
    symptomPoints = 100;
    reasons.push(`High-consequence symptom pattern recorded: ${symptoms.join(", ")}`);
  } else if (matchedModCount >= 3) {
    symptomPoints = 70;
    reasons.push(`Multi-symptom flock distress: ${matchedModCount} concurrent symptoms flagged (${symptoms.join(", ")})`);
  } else if (matchedModCount >= 1) {
    symptomPoints = 35 * matchedModCount;
    reasons.push(`Physical symptom indicators observed: ${symptoms.join(", ")}`);
  }
  scoreBreakdown.symptoms = symptomPoints;

  // F. Shed Environment / Ambient Weather Heat Stress
  let tempDeviation: number | undefined;
  let tempPoints = 0;
  let activeEnvWeight = rules.WEIGHT_ENVIRONMENT;

  const hasShedTemp = log.shedTemp !== null && log.shedTemp !== undefined;
  const hasWeather = weather && typeof weather.temp === "number";

  if (hasShedTemp) {
    if (log.shedTemp! > ageBand.tempToleranceMax) {
      tempDeviation = Number((log.shedTemp! - ageBand.tempToleranceMax).toFixed(1));
    }

    if (log.shedTemp! >= rules.SHED_TEMP_CRITICAL_CELSIUS) {
      tempPoints = 100;
      reasons.push(
        `Critical shed temperature (${log.shedTemp}°C) exceeds heat prostration limit of ${rules.SHED_TEMP_CRITICAL_CELSIUS}°C`
      );
    } else if (log.shedTemp! >= rules.SHED_TEMP_HIGH_CELSIUS) {
      tempPoints = 60;
      reasons.push(
        `High shed indoor temperature (${log.shedTemp}°C, warning threshold ${rules.SHED_TEMP_HIGH_CELSIUS}°C)`
      );
    } else if (log.shedTemp! > ageBand.tempToleranceMax + 4) {
      tempPoints = 35;
      reasons.push(
        `Shed temperature (${log.shedTemp}°C) is above optimal comfort zone (${ageBand.tempToleranceMax}°C) for ${ageBand.bandName}`
      );
    }

    // Compound with ambient outdoor weather THI if available
    if (hasWeather && weather.thi && weather.thi >= 78) {
      if (tempPoints >= 60) {
        tempPoints = Math.min(100, tempPoints + 20);
        reasons.push(
          `Extreme heat prostration risk: Outdoor THI of ${weather.thi} (${weather.temp}°C, ${weather.humidity}% RH) severely impairs shed evaporative cooling`
        );
      } else {
        tempPoints = Math.max(tempPoints, 40);
        reasons.push(
          `Elevated outdoor heat stress (THI ${weather.thi}) puts shed microclimate under thermal load`
        );
      }
    }
  } else if (hasWeather && weather.thi && weather.thi >= 78) {
    // If farmer did not record manual indoor temp, use hyper-local ambient THI
    if (weather.thi >= 84) {
      tempPoints = 75;
      reasons.push(
        `Critical ambient weather heat stress (THI ${weather.thi}, ${weather.temp}°C). High heat prostration risk for flock`
      );
    } else {
      tempPoints = 45;
      reasons.push(
        `Alert: Outdoor weather indicates ambient heat stress (THI ${weather.thi}, ${weather.temp}°C)`
      );
    }
  } else {
    activeEnvWeight = 0;
  }
  scoreBreakdown.environment = tempPoints;

  // 4. Calculate Composite Weighted Score
  const totalWeight =
    rules.WEIGHT_MORTALITY +
    activeWaterWeight +
    activeFeedWeight +
    activeEggWeight +
    rules.WEIGHT_SYMPTOMS +
    activeEnvWeight;

  const weightedSum =
    mortalityPoints * rules.WEIGHT_MORTALITY +
    waterPoints * activeWaterWeight +
    feedPoints * activeFeedWeight +
    eggPoints * activeEggWeight +
    symptomPoints * rules.WEIGHT_SYMPTOMS +
    tempPoints * activeEnvWeight;

  const compositeScore = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(1)) : 0;

  // 5. Determine Severity
  // Deterministic rule: Hard red-flags override and force RED
  let severity: "GREEN" | "AMBER" | "RED" = "GREEN";

  if (redFlags.triggered || hasHighRiskSym || mortalityRate >= rules.MORTALITY_RATE_CRITICAL || compositeScore >= rules.RISK_SCORE_RED_THRESHOLD) {
    severity = "RED";
    if (redFlags.triggered) {
      for (const rfReason of redFlags.reasons) {
        if (!reasons.includes(rfReason)) {
          reasons.unshift(rfReason);
        }
      }
    }
  } else if (compositeScore >= rules.RISK_SCORE_AMBER_THRESHOLD || mortalityRate >= rules.MORTALITY_RATE_WARNING || matchedModCount >= 1 || (feedDeviationPercent && feedDeviationPercent >= rules.FEED_DROP_WARNING_PERCENT) || (waterDeviationPercent && waterDeviationPercent >= rules.WATER_DROP_WARNING_PERCENT)) {
    severity = "AMBER";
  }

  // Fallback reason if healthy
  if (reasons.length === 0) {
    reasons.push("All flock indicators (mortality, feed, water intake) remain within normal expected baseline limits.");
  }

  // 6. Practical Agricultural Recommendations (2-4 items)
  const recommendations: string[] = [];
  if (severity === "RED") {
    recommendations.push(
      "Immediately quarantine the affected shed/pen and restrict entry to designated personnel."
    );
    recommendations.push(
      "Do NOT administer unverified broad-spectrum antibiotics without diagnostic sensitivity testing."
    );
    recommendations.push(
      "Provide clean drinking water fortified with electrolytes and Vitamin C to mitigate shock."
    );
    recommendations.push(
      "Contact an authorized poultry veterinarian or submit fresh dead birds to the nearest post-mortem diagnostic lab within 4 hours."
    );
  } else if (severity === "AMBER") {
    recommendations.push(
      "Inspect waterline pressure regulators and test nipples for physical blockages or air-locks."
    );
    recommendations.push(
      "Check shed ventilation curtains and exhaust fans to ensure adequate airflow without drafts."
    );
    recommendations.push(
      "Closely monitor feed intake during next morning distribution and isolate any lethargic birds."
    );
    recommendations.push(
      "If loose droppings persist into tomorrow, prepare fresh stool samples for laboratory coccidiosis check."
    );
  } else {
    recommendations.push(
      "Maintain standard biosecurity foot-dip disinfection at shed entrances."
    );
    recommendations.push(
      "Continue regular water sanitation (chlorination/acidification) and record evening check-in."
    );
    recommendations.push(
      "Ensure litter remains dry and friable; rake damp spots under waterers."
    );
  }

  return {
    severity,
    reasons,
    recommendations,
    signalsTriggered: {
      mortalityRate: Number(mortalityRate.toFixed(2)),
      feedDeviationPercent,
      waterDeviationPercent,
      eggDeviationPercent,
      shedTempDeviation: tempDeviation,
      hardRedFlag: redFlags.triggered || hasHighRiskSym,
      redFlagReasons: redFlags.reasons,
      confidence: baseline.confidence,
      compositeScore,
      scoreBreakdown,
      ageInDays,
      ageBand: ageBand.bandName,
    },
  };
}
