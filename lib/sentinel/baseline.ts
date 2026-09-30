import { BatchBaseline, MetricBaseline } from "@/types/sentinel";

/**
 * Calculates descriptive statistics (mean, median, standard deviation, min, max)
 * for a series of numbers.
 */
export function calculateMetricBaseline(values: number[]): MetricBaseline | null {
  const cleanValues = values.filter((v) => typeof v === "number" && !isNaN(v));
  if (cleanValues.length === 0) return null;

  const count = cleanValues.length;
  const sum = cleanValues.reduce((acc, curr) => acc + curr, 0);
  const mean = Number((sum / count).toFixed(2));

  // Sort ascending for median and percentiles
  const sorted = [...cleanValues].sort((a, b) => a - b);
  let median: number;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    median = Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
  } else {
    median = sorted[mid];
  }

  // Standard deviation (sample std dev if count > 1, else 0)
  let stdDev = 0;
  if (count > 1) {
    const variance =
      cleanValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      (count - 1);
    stdDev = Number(Math.sqrt(variance).toFixed(2));
  }

  return {
    mean,
    median,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    sampleCount: count,
  };
}

/**
 * Pure function computing a batch's rolling baseline from historical DailyHealthLog records.
 * 
 * Requirement 2:
 * - Computes rolling 7-day median/mean + variability for mortality, feed, water, egg production.
 * - Handles early-batch cases (fewer than 7 logs) gracefully: reduces confidence, does NOT
 *   fabricate a false baseline.
 */
export function calculateBatchBaseline(
  logs: Array<{
    mortality: number;
    feedKg?: number | null;
    waterLitres?: number | null;
    eggCount?: number | null;
    shedTemp?: number | null;
    date: Date | string;
  }>
): BatchBaseline {
  // Use up to the most recent 7 logs for rolling 7-day baseline
  const recentLogs = logs.slice(0, 7);
  const daysAvailable = recentLogs.length;

  let confidence: "HIGH" | "MEDIUM" | "LOW" | "INSUFFICIENT" = "HIGH";
  if (daysAvailable === 0) {
    confidence = "INSUFFICIENT";
  } else if (daysAvailable < 4) {
    confidence = "LOW";
  } else if (daysAvailable < 7) {
    confidence = "MEDIUM";
  }

  const mortalities = recentLogs.map((l) => l.mortality);
  const feedValues = recentLogs
    .map((l) => l.feedKg)
    .filter((v): v is number => v !== null && v !== undefined);
  const waterValues = recentLogs
    .map((l) => l.waterLitres)
    .filter((v): v is number => v !== null && v !== undefined);
  const eggValues = recentLogs
    .map((l) => l.eggCount)
    .filter((v): v is number => v !== null && v !== undefined);
  const tempValues = recentLogs
    .map((l) => l.shedTemp)
    .filter((v): v is number => v !== null && v !== undefined);

  return {
    daysAvailable,
    confidence,
    mortality: calculateMetricBaseline(mortalities),
    feedKg: calculateMetricBaseline(feedValues),
    waterLitres: calculateMetricBaseline(waterValues),
    eggCount: calculateMetricBaseline(eggValues),
    shedTemp: calculateMetricBaseline(tempValues),
  };
}
