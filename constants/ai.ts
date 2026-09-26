/**
 * Pankh AI — Module Constants
 * Contains static configuration, domain regex patterns, and default prompt parameters.
 */

import { PankhIntent } from "@/types/ai";

export const EMBEDDING_DIMENSION = 1536;

export const HEALTH_RELATED_INTENTS = new Set<PankhIntent>([
  "health",
  "feed",
  "vaccine",
  "hygiene",
  "weather",
  "emergency",
]);

// Multilingual Red-Flag Patterns (English, Hindi, Punjabi-Latin)
export const MORTALITY_PATTERNS = [
  /\b(?:mortality\s*spike|high\s*mortality|sudden\s*death|heavy\s*death)\b/i,
  /\b(?:chicks?\s*dying|birds?\s*dying|flock\s*dying|dead\s*birds?)\b/i,
  /\b(?:mar\s*rahi\s*hai[n]?|achanak\s*maut|dharadhad\s*mar|mar\s*gaye|maran\s*lag\s*payi)\b/i,
  /\b(?:roz\s*\d+\s*(?:mar|chooje|chicks)|moti\s*tadaad\s*me\s*maut)\b/i,
  /\b(?:\d+\s*(?:chicks?|birds?|murghi)\s*(?:died|mar\s*gayi))\b/i,
  /\b(?:bina\s*kisi\s*wajah\s*mar|subah\s*se\s*\d+\s*mar)\b/i,
];

export const NEUROLOGICAL_PATTERNS = [
  /\b(?:torticollis|star\s*gazing|star-gazing)\b/i,
  /\b(?:neck\s*twist(?:ing|ed)?|twisted\s*neck|head\s*twist(?:ing|ed)?)\b/i,
  /\b(?:gardand?\s*mud(?:i|na)?|gardan\s*ghoom|gardan\s*ulti)\b/i,
  /\b(?:ataxia|ladkhada(?:na|kar)?|chakkar\s*aa\s*rahe|tremors|kampan)\b/i,
  /\b(?:paralysis|lakwa|pair\s*sookh|pair\s*kaam\s*nahi|chal\s*nahi\s*paa)\b/i,
  /\b(?:loss\s*of\s*balance|inability\s*to\s*stand|falling\s*over)\b/i,
];

export const SEVERE_RESPIRATORY_PATTERNS = [
  /\b(?:gasping|severe\s*gasping|gasping\s*for\s*air|open\s*mouth\s*breath(?:ing)?)\b/i,
  /\b(?:munh\s*khol\s*kar\s*saans|munh\s*khol\s*ke\s*saans|saans\s*lene\s*me\s*takleef)\b/i,
  /\b(?:rales|ghur-ghur|ghur\s*ghur|khad-khad|snoring\s*sound)\b/i,
  /\b(?:coughing\s*blood|blood\s*in\s*trachea|khoon\s*ki\s*ulti|khoon\s*aana)\b/i,
  /\b(?:cyanotic\s*comb|blue\s*comb|purple\s*comb|neeli\s*kalgi|kalgi\s*neeli)\b/i,
  /\b(?:suffocation|choking|haaf\s*rahi\s*hai|dam\s*ghut)\b/i,
];

export const WATER_DROP_PATTERNS = [
  /\b(?:refusing\s*water|stopped\s*drinking|low\s*water\s*intake)\b/i,
  /\b(?:paani\s*nahi\s*pee\s*rahi|paani\s*chhod\s*diya|pani\s*bilkul\s*band)\b/i,
  /\b(?:pani\s*nahi\s*pi\s*rahi|drinker\s*abandoned)\b/i,
];

export const SYMPTOM_CLUSTERS = {
  respiratory: [
    "cough", "sneeze", "discharge", "snick", "gasp", "rales", "swollen eye", "khansi",
    "saans", "nazla", "zukaam", "aankh sooj"
  ],
  enteric: [
    "diarrhea", "loose droppings", "green droppings", "white droppings", "bloody droppings",
    "dast", "patli tatti", "hari tatti", "khooni dast", "coccidiosis"
  ],
  neurological: [
    "twist", "torticollis", "ataxia", "tremor", "paralysis", "lakwa", "gardand",
    "ladkhadana", "star gazing"
  ],
  systemic: [
    "lethargy", "dull", "huddling", "off feed", "not eating", "fever", "ruffled",
    "sust", "hila nahi", "khana chhod", "dana nahi kha"
  ],
  physical: [
    "swollen head", "swollen wattle", "blue comb", "pale comb", "bleeding", "soojan",
    "kalgi neeli", "chehra sooj"
  ],
};

export const PUNJABI_TERM_EXPANSIONS: Record<string, string> = {
  chooja: "chick broiler day-old",
  chooje: "chicks broilers flock",
  dana: "feed starter pre-starter nutrition crude protein",
  daana: "feed nutrition ration",
  pani: "water drinking nipple intake",
  paani: "water drinking drinker pipeline",
  teeka: "vaccine vaccination immunization",
  teeke: "vaccines lasota gumboro",
  garmi: "heat stress summer shed temperature foggers",
  loo: "heat wave ventilation cooling",
  chuna: "slaked lime whitewash biosecurity",
  khad: "litter caked manure ammonia",
  gasping: "gasping open mouth breathing respiratory rales",
  gardand: "neck twisting torticollis star gazing",
  lakwa: "paralysis wing droop lameness",
  dast: "diarrhea loose droppings coccidiosis",
};
