import { AlertRuleMap } from "@/types/sentinel";
import { prisma } from "@/lib/db";

export const DEFAULT_ALERT_RULES: AlertRuleMap = {
  // Thresholds
  MORTALITY_RATE_WARNING: 0.5, // 0.5% daily flock mortality
  MORTALITY_RATE_CRITICAL: 1.0, // 1.0% daily flock mortality
  FEED_DROP_WARNING_PERCENT: 15.0, // 15% feed drop vs expected baseline
  FEED_DROP_CRITICAL_PERCENT: 25.0, // 25% feed drop
  WATER_DROP_WARNING_PERCENT: 15.0, // 15% water drop vs expected baseline
  WATER_DROP_CRITICAL_PERCENT: 25.0, // 25% water drop
  EGG_DROP_WARNING_PERCENT: 10.0, // 10% egg drop for layers
  EGG_DROP_CRITICAL_PERCENT: 20.0, // 20% egg drop
  SHED_TEMP_HIGH_CELSIUS: 34.0, // 34°C warm shed
  SHED_TEMP_CRITICAL_CELSIUS: 38.0, // 38°C severe heat stress
  // Metric Weights in Risk Engine
  WEIGHT_MORTALITY: 35.0,
  WEIGHT_WATER: 25.0,
  WEIGHT_FEED: 20.0,
  WEIGHT_SYMPTOMS: 15.0,
  WEIGHT_ENVIRONMENT: 5.0,
  // Composite score thresholds
  RISK_SCORE_AMBER_THRESHOLD: 30.0,
  RISK_SCORE_RED_THRESHOLD: 60.0,
};

/**
 * Loads AlertRules from database with fallback to DEFAULT_ALERT_RULES.
 */
export async function getAlertRulesMap(): Promise<AlertRuleMap> {
  try {
    const rulesFromDb = await prisma.alertRule.findMany();
    const map: AlertRuleMap = { ...DEFAULT_ALERT_RULES };

    for (const rule of rulesFromDb) {
      map[rule.thresholdKey] = rule.thresholdValue;
    }

    return map;
  } catch (error) {
    console.warn("Could not query alert rules from database, using defaults:", error);
    return { ...DEFAULT_ALERT_RULES };
  }
}
