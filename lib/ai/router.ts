/**
 * Pankh AI — Intent Router & Classifier
 * 
 * Classifies farmer queries into 9 discrete intent categories:
 * - health: Non-emergency clinical issues, symptoms, diseases, medications
 * - feed: Feeds, rations, crude protein, daily consumption, FCR
 * - vaccine: Immunization schedules, cold chain, vaccination techniques
 * - hygiene: Biosecurity, footbaths, shed downtime, lime-wash, disinfection
 * - weather: Heat stress, winter brooding, ventilation, temp/humidity
 * - economics: Feed costs, batch profit/margin, bird sale price, ROI
 * - general_management: Lighting schedules, stocking density, farm equipment
 * - emergency: Acute mortality spikes, neurological signs, severe gasping
 * - unrelated: Questions outside poultry farming / agriculture
 */

import { PankhIntent, IntentClassificationResult } from "@/types/ai";
import { HEALTH_RELATED_INTENTS } from "@/constants/ai";
import { callLlm } from "./llmClient";

export type { PankhIntent, IntentClassificationResult };

/**
 * Deterministic keyword & regex fallback intent classifier.
 */
export function classifyIntentDeterministically(query: string): IntentClassificationResult {
  const q = query.toLowerCase();

  // 1. Emergency triggers
  if (
    /\b(?:mortality\s*spike|achanak\s*maut|dharadhad\s*mar|mar\s*rahi\s*hai|dying\s*fast|torticollis|star\s*gazing|gasping|gardand\s*mud|gardana\s*ghoom|khoon\s*ki\s*ulti|severe\s*gasping)\b/i.test(
      q
    )
  ) {
    return {
      intent: "emergency",
      confidence: 0.95,
      reasoning: "Emergency mortality, neurological, or acute respiratory distress pattern identified.",
      isHealthRelated: true,
    };
  }

  // 2. Unrelated check (human food/recipes, movies, sports, tech) checked early
  // to avoid false positives like "can I feed pizza / burgers to my chickens"
  if (
    /\b(?:pizza|burger|pasta|paneer|samosa|movie|cinema|actor|cricket|ipl|football|car|bike|recipe|python|javascript|laptop|phone)\b/i.test(
      q
    )
  ) {
    return {
      intent: "unrelated",
      confidence: 0.95,
      reasoning: "Non-poultry or non-agricultural general knowledge query.",
      isHealthRelated: false,
    };
  }

  // 3. Vaccine triggers
  if (
    /\b(?:vaccin|teeka|teeke|lasota|gumboro|ibd|marek|ranikhet\s*vaccine|eye\s*drop|booster|cold\s*chain|skim\s*milk)\b/i.test(
      q
    )
  ) {
    return {
      intent: "vaccine",
      confidence: 0.9,
      reasoning: "Vaccination schedule or biological administration query.",
      isHealthRelated: true,
    };
  }

  // 4. Economics & cost triggers (evaluated before generic feed)
  if (
    /\b(?:profit|loss|karcha|cost|feed\s*cost|price|rupee|₹|inr|mandi|rate|margin|sale\s*price|bird\s*rate)\b/i.test(
      q
    )
  ) {
    return {
      intent: "economics",
      confidence: 0.88,
      reasoning: "Economics, operational expenditure, or batch revenue query.",
      isHealthRelated: false,
    };
  }

  // 5. Feed & nutrition triggers
  if (
    /\b(?:feed|dana|daana|ration|fcr|starter|pre-starter|finisher|crude\s*protein|protein|intake|feed\s*drop|feed\s*chart)\b/i.test(
      q
    )
  ) {
    return {
      intent: "feed",
      confidence: 0.88,
      reasoning: "Feed management, nutrition requirements, or feed conversion ratio query.",
      isHealthRelated: true,
    };
  }

  // 6. Weather & heat stress triggers
  if (
    /\b(?:heat\s*stress|garmi|loo|summer|temperature|shed\s*temp|fogger|sprinkler|thatch|parali|winter|brooding\s*temp|humidity)\b/i.test(
      q
    )
  ) {
    return {
      intent: "weather",
      confidence: 0.88,
      reasoning: "Climate, heat stress mitigation, or environmental control query.",
      isHealthRelated: true,
    };
  }

  // 7. Hygiene & biosecurity triggers
  if (
    /\b(?:biosecurity|hygiene|chuna|slaked\s*lime|whitewash|disinfection|sanitiz|foot\s*bath|kmno4|lal\s*dawai|downtime|litter|ammonia)\b/i.test(
      q
    )
  ) {
    return {
      intent: "hygiene",
      confidence: 0.85,
      reasoning: "Farm sanitation, biosecurity protocols, or shed disinfection query.",
      isHealthRelated: true,
    };
  }

  // 8. Health & symptom triggers
  if (
    /\b(?:symptom|ill|bimari|bimaar|disease|droppings|diarrhea|dast|cough|khansi|swelling|soojan|comb|coccidiosis|e\s*coli|crnd|antibiotic|dawaii)\b/i.test(
      q
    )
  ) {
    return {
      intent: "health",
      confidence: 0.85,
      reasoning: "General flock health, symptom observation, or pathology query.",
      isHealthRelated: true,
    };
  }

  // 9. General management triggers
  if (
    /\b(?:lighting|density|shed|equipment|nipple|feeder|brooder|space|ventilation|fans)\b/i.test(
      q
    )
  ) {
    return {
      intent: "general_management",
      confidence: 0.75,
      reasoning: "General poultry flock management or shed equipment query.",
      isHealthRelated: true,
    };
  }

  return {
    intent: "general_management",
    confidence: 0.6,
    reasoning: "Default poultry management categorization.",
    isHealthRelated: true,
  };
}

/**
 * Classifies user intent by querying OpenRouter LLM with JSON structured output,
 * with graceful fallback to deterministic classification.
 */
export async function classifyIntent(query: string): Promise<IntentClassificationResult> {
  try {
    const systemPrompt = `You are the Intent Router for Pankh, a poultry farm intelligence platform in Punjab, India.
Classify the farmer's query into exactly one of these categories:
- health: Non-emergency diseases, symptoms, illness, droppings changes.
- feed: Feed management, nutrition, crude protein, intake, FCR.
- vaccine: Immunization schedule, vaccines, cold chain, dosage.
- hygiene: Biosecurity, disinfection, lime whitewash, downtime, footbaths.
- weather: Heat stress, temperature, foggers, ventilation, winter brooding.
- economics: Costs, profits, revenue, mandi rates, margins.
- general_management: Housing, lighting, stocking density, drinkers.
- emergency: Acute mortality spikes, sudden heavy deaths, torticollis / neck twisting, severe gasping.
- unrelated: Non-poultry queries (e.g. human food recipes, sports, cars).

Return ONLY valid JSON matching this schema:
{
  "intent": "health" | "feed" | "vaccine" | "hygiene" | "weather" | "economics" | "general_management" | "emergency" | "unrelated",
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation"
}`;

    const rawOutput = await callLlm({
      systemPrompt,
      userPrompt: `Query: ${query}`,
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 150,
    });

    if (rawOutput) {
      const parsed = JSON.parse(rawOutput);
      const validIntents: PankhIntent[] = [
        "health",
        "feed",
        "vaccine",
        "hygiene",
        "weather",
        "economics",
        "general_management",
        "emergency",
        "unrelated",
      ];
      if (validIntents.includes(parsed.intent)) {
        return {
          intent: parsed.intent,
          confidence: parsed.confidence ?? 0.9,
          reasoning: parsed.reasoning ?? "LLM structured classification",
          isHealthRelated: HEALTH_RELATED_INTENTS.has(parsed.intent),
        };
      }
    }
  } catch {
    // Fallback to deterministic classification on API failure
  }

  return classifyIntentDeterministically(query);
}
