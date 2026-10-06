/**
 * Pankh Farm Economics — Rule-Based Deterministic Insights Engine
 * 
 * Strict Financial Safety Rules (brief 6.3 & AGENTS.md):
 * 1. Financial calculation and insight numbers must be 100% deterministic.
 * 2. LLMs NEVER calculate or alter numbers.
 * 3. Optional OpenRouter step is used ONLY to polish agrarian tone in Punjabi/Hindi.
 * 4. All assumptions are explicitly labeled.
 */

import {
  BatchEconomicsReport,
  EconomicsInsight,
} from "@/types/economics";
import { callLlm } from "@/lib/ai/llmClient";

/**
 * Generates rule-based deterministic financial insights for a flock batch.
 */
export function generateDeterministicInsights(
  current: BatchEconomicsReport,
  previous: BatchEconomicsReport | null = null
): EconomicsInsight[] {
  const insights: EconomicsInsight[] = [];

  const totalCost = current.totalBatchCost.value ?? 0;
  const feedCost = current.feedExpense.value ?? 0;
  const feedShare = current.feedCostShare.value ?? 0;
  const mortalityRate = current.mortalityRate.value ?? 0;
  const deaths = current.mortalityCount;
  const mortalityLoss = current.estimatedMortalityLoss.value ?? 0;
  const assumedBirdVal = current.assumedValuePerBird;
  const costPerPlaced = current.costPerBirdPlaced.value ?? 0;
  const costPerSurviving = current.costPerSurvivingBird.value ?? 0;
  const revenue = current.revenue.value ?? 0;
  const grossMargin = current.grossMargin.value ?? 0;

  // 1. Data Quality & Missing Inputs Alerts (Financial Safety)
  if (current.totalBatchCost.missingInputs.includes("chickPurchaseCost")) {
    insights.push({
      id: "missing-chick-cost",
      type: "data_quality",
      severity: "warning",
      headline: "Chick Purchase Not Recorded",
      body: "Chick procurement cost is missing from your batch transactions. Current total cost (₹" +
        totalCost.toLocaleString("en-IN") +
        ") is an underestimate until chick cost is entered.",
      deterministicNumbers: { totalCost },
      isEstimated: true,
      assumptionLabel: "Incomplete Expense Record",
    });
  }

  // 2. Feed Cost Structure Insight
  if (totalCost > 0 && feedCost > 0) {
    let feedBody = `Feed is ${feedShare}% of your recorded batch cost (₹${feedCost.toLocaleString("en-IN")} of ₹${totalCost.toLocaleString("en-IN")} total).`;

    if (previous && previous.feedCostShare.value !== null) {
      const prevShare = previous.feedCostShare.value;
      const diff = Math.round((feedShare - prevShare) * 10) / 10;
      if (Math.abs(diff) >= 1) {
        const direction = diff > 0 ? "up" : "down";
        feedBody += ` This is ${direction} by ${Math.abs(diff)} percentage points from your previous closed batch (${prevShare}%).`;
      } else {
        feedBody += ` This is consistent with your previous closed batch (${prevShare}%).`;
      }
    }

    insights.push({
      id: "feed-cost-share",
      type: "cost_structure",
      severity: feedShare > 70 ? "warning" : "info",
      headline: `Feed Cost Share: ${feedShare}% of Total Spend`,
      body: feedBody,
      deterministicNumbers: {
        feedShare,
        feedCost,
        totalCost,
        previousFeedShare: previous?.feedCostShare.value ?? 0,
      },
      isEstimated: false,
    });
  }

  // 3. Mortality Financial Impact Insight
  if (deaths > 0 && mortalityLoss > 0) {
    let mortBody = `Flock mortality has reached ${mortalityRate}% (${deaths.toLocaleString("en-IN")} birds). Approximately ₹${mortalityLoss.toLocaleString("en-IN")} of avoidable loss at an assumed replacement value of ₹${assumedBirdVal}/bird.`;

    if (previous && previous.mortalityRate.value !== null) {
      const prevMort = previous.mortalityRate.value;
      const mortDiff = Math.round((mortalityRate - prevMort) * 10) / 10;
      if (Math.abs(mortDiff) >= 0.5) {
        const direction = mortDiff > 0 ? "higher" : "lower";
        mortBody += ` Mortality is ${Math.abs(mortDiff)} percentage points ${direction} than your previous batch (${prevMort}%).`;
      }
    }

    insights.push({
      id: "mortality-loss-impact",
      type: "mortality_loss",
      severity: mortalityRate >= 5 ? "urgent" : mortalityRate >= 3 ? "warning" : "info",
      headline: `Flock Mortality Loss: ₹${mortalityLoss.toLocaleString("en-IN")}`,
      body: mortBody,
      deterministicNumbers: {
        mortalityRate,
        deaths,
        mortalityLoss,
        assumedBirdVal,
      },
      isEstimated: true,
      assumptionLabel: `Assuming ₹${assumedBirdVal}/bird value`,
    });
  }

  // 4. Cost Per Surviving Bird vs Placed Bird
  if (costPerPlaced > 0 && costPerSurviving > 0 && deaths > 0) {
    const diffPerBird = Math.round((costPerSurviving - costPerPlaced) * 100) / 100;
    insights.push({
      id: "surviving-cost-divergence",
      type: "feed_efficiency",
      severity: diffPerBird > 5 ? "warning" : "info",
      headline: `Cost Divergence: +₹${diffPerBird}/bird due to mortality`,
      body: `Your recorded cost per bird placed is ₹${costPerPlaced.toFixed(2)}. Due to ${deaths} flock mortalities, the cost per surviving bird rises to ₹${costPerSurviving.toFixed(2)}.`,
      deterministicNumbers: {
        costPerPlaced,
        costPerSurviving,
        diffPerBird,
        deaths,
      },
      isEstimated: current.costPerSurvivingBird.isEstimated,
    });
  }

  // 5. Revenue & Gross Margin Realization
  if (revenue > 0) {
    const isProfitable = grossMargin >= 0;
    insights.push({
      id: "margin-realization",
      type: "margin_alert",
      severity: isProfitable ? "positive" : "warning",
      headline: isProfitable
        ? `Flock Profit Margin: +₹${grossMargin.toLocaleString("en-IN")}`
        : `Flock Deficit: -₹${Math.abs(grossMargin).toLocaleString("en-IN")}`,
      body: `Recorded flock revenue stands at ₹${revenue.toLocaleString("en-IN")} against total expenditure of ₹${totalCost.toLocaleString("en-IN")}. Current net gross margin is ${isProfitable ? "+" : "-"}₹${Math.abs(grossMargin).toLocaleString("en-IN")}.`,
      deterministicNumbers: {
        revenue,
        totalCost,
        grossMargin,
      },
      isEstimated: false,
    });
  } else if (totalCost > 0 && current.status === "ACTIVE") {
    insights.push({
      id: "break-even-target",
      type: "margin_alert",
      severity: "info",
      headline: `Target Break-Even: ₹${costPerSurviving.toFixed(2)}/bird`,
      body: `With ₹${totalCost.toLocaleString("en-IN")} recorded expenditure and ${current.currentBirds.toLocaleString("en-IN")} birds remaining, each bird must realize at least ₹${costPerSurviving.toFixed(2)} at lift to recover all batch costs.`,
      deterministicNumbers: {
        totalCost,
        currentBirds: current.currentBirds,
        breakEven: costPerSurviving,
      },
      isEstimated: current.costPerSurvivingBird.isEstimated,
      assumptionLabel: "Based on current flock count",
    });
  }

  return insights;
}

/**
 * Optional OpenRouter tone polishing:
 * Takes deterministic insight and rewrites the sentence in natural agrarian Punjabi/Hindi.
 * NEVER alters the underlying numbers.
 */
export async function rephraseInsightWithTone(
  insight: EconomicsInsight,
  language: "pa" | "hi" | "en" = "pa"
): Promise<string> {
  if (language !== "en") {
    try {
      const systemPrompt = `You are a Punjabi poultry farming economics assistant. 
TASK: Rephrase the provided poultry financial insight sentence into a natural, respectful, supportive ${language === "pa" ? "Punjabi (Gurmukhi)" : "Hindi (Devanagari)"} tone for a farmer.

CRITICAL HARD RULE: You must PRESERVE EVERY SINGLE NUMBER AND CURRENCY EXACTLY AS WRITTEN. NEVER change, round, or recalculate any numbers, percentages, or rupee amounts.
Output ONLY the rephrased sentence text, nothing else.`;

      const output = await callLlm({
        systemPrompt,
        userPrompt: `Insight Headline: "${insight.headline}"\nInsight Body: "${insight.body}"`,
        jsonMode: false,
        temperature: 0.1,
        maxTokens: 150,
      });

      if (output && output.trim().length > 5) {
        return output.trim();
      }
    } catch (e) {
      console.warn("LLM tone polishing fallback to deterministic:", e);
    }
  }

  // Deterministic localized fallback
  return getDeterministicLocalizedInsightBody(insight, language);
}

/**
 * Localized deterministic agrarian sentences for all 4 supported languages.
 */
export function getDeterministicLocalizedInsightBody(
  insight: EconomicsInsight,
  language: "pa" | "hi" | "en"
): string {
  const nums = insight.deterministicNumbers;

  if (insight.id === "feed-cost-share") {
    switch (language) {
      case "pa":
        return `ਤੁਹਾਡੇ ਬੈਚ ਦੇ ਕੁੱਲ ਖ਼ਰਚੇ (₹${Number(nums.totalCost || 0).toLocaleString("en-IN")}) ਵਿੱਚੋਂ ਫ਼ੀਡ ਦਾ ਹਿੱਸਾ ${nums.feedShare}% (₹${Number(nums.feedCost || 0).toLocaleString("en-IN")}) ਹੈ।`;
      case "hi":
        return `आपके बैच के कुल खर्च (₹${Number(nums.totalCost || 0).toLocaleString("en-IN")}) में से दाने (feed) का हिस्सा ${nums.feedShare}% (₹${Number(nums.feedCost || 0).toLocaleString("en-IN")}) है।`;
      default:
        return insight.body;
    }
  }

  if (insight.id === "mortality-loss-impact") {
    switch (language) {
      case "pa":
        return `ਬੈਚ ਵਿੱਚ ਕੁੱਲ ਮੋਰਟੈਲਿਟੀ ${nums.mortalityRate}% (${nums.deaths} ਮੁਰਗੇ) ਹੋਈ ਹੈ। ₹${nums.assumedBirdVal}/ਮੁਰਗੇ ਦੇ ਹਿਸਾਬ ਨਾਲ ਲਗਭਗ ₹${Number(nums.mortalityLoss || 0).toLocaleString("en-IN")} ਦਾ ਨੁਕਸਾਨ ਹੋਇਆ ਹੈ।`;
      case "hi":
        return `बैच में कुल मृत्यु दर ${nums.mortalityRate}% (${nums.deaths} चूजे/मुर्गे) हो चुकी है। ₹${nums.assumedBirdVal}/पक्षी के हिसाब से लगभग ₹${Number(nums.mortalityLoss || 0).toLocaleString("en-IN")} का नुकसान हुआ है।`;
      default:
        return insight.body;
    }
  }

  if (insight.id === "surviving-cost-divergence") {
    switch (language) {
      case "pa":
        return `ਪਾਏ ਗਏ ਮੁਰਗਿਆਂ ਅਨੁਸਾਰ ਲਾਗਤ ₹${Number(nums.costPerPlaced || 0).toFixed(2)} ਸੀ, ਪਰ ${nums.deaths} ਮੌਤਾਂ ਕਾਰਨ ਬਚੇ ਮੁਰਗਿਆਂ 'ਤੇ ਲਾਗਤ ਵਧ ਕੇ ₹${Number(nums.costPerSurviving || 0).toFixed(2)} ਹੋ ਗਈ ਹੈ।`;
      case "hi":
        return `प्रति डाले गए पक्षी पर लागत ₹${Number(nums.costPerPlaced || 0).toFixed(2)} थी, लेकिन ${nums.deaths} मौतों के कारण जीवित पक्षियों पर प्रति पक्षी लागत बढ़कर ₹${Number(nums.costPerSurviving || 0).toFixed(2)} हो गई है।`;
      default:
        return insight.body;
    }
  }

  return insight.body;
}
