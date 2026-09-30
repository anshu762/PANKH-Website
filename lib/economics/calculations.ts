/**
 * Pankh Farm Economics — Pure Deterministic Calculation Engine
 * 
 * Strict Financial Safety Rules (brief 6.2 & AGENTS.md):
 * 1. Financial calculations must be 100% deterministic and pure.
 * 2. LLMs NEVER compute or alter financial numbers.
 * 3. Every function returns both the value and explicit flags for missing or assumed inputs.
 * 4. FCR is ONLY computed if weight-gain data exists; otherwise explicitly returns null with a reason.
 * 5. Assumptions (e.g. assumed value per bird for mortality loss) are never silently baked in.
 */

import {
  CalculationResult,
  BatchEconomicsReport,
  CategorySummaryItem,
  DailyExpenseTrendItem,
  TransactionRecord,
} from "@/types/economics";

export interface TransactionLike {
  id?: string;
  type: "EXPENSE" | "REVENUE";
  category: string;
  amount: number | string | { toNumber?: () => number; toString?: () => string };
  quantity?: number | null;
  unit?: string | null;
  note?: string | null;
  date: Date | string;
  createdAt?: Date | string;
}

export interface BatchLike {
  id: string;
  birdType: string;
  breed: string;
  productionType: "BROILER" | "LAYER";
  placementDate: Date | string;
  startingBirds: number;
  currentBirds: number;
  status: "ACTIVE" | "CLOSED";
  farm?: { name?: string; [key: string]: any };
}

export interface DailyLogLike {
  id?: string;
  date: Date | string;
  mortality: number;
  feedKg?: number | null;
  waterLitres?: number | null;
  notes?: string | null;
}

/**
 * Normalizes any number or Decimal-like amount into a clean 2-decimal number.
 */
export function normalizeAmount(amount: any): number {
  if (typeof amount === "number") return Math.round(amount * 100) / 100;
  if (!amount) return 0;
  if (typeof amount.toNumber === "function") return Math.round(amount.toNumber() * 100) / 100;
  const parsed = parseFloat(String(amount));
  return isNaN(parsed) ? 0 : Math.round(parsed * 100) / 100;
}

/**
 * 1. totalBatchCost: Sum of all EXPENSE transactions for the batch.
 */
export function calculateTotalBatchCost(
  transactions: TransactionLike[]
): CalculationResult<number> {
  const expenseTxs = transactions.filter((t) => t.type === "EXPENSE");
  const missingInputs: string[] = [];
  const assumptions: string[] = [];

  const total = expenseTxs.reduce((sum, t) => sum + normalizeAmount(t.amount), 0);
  const rounded = Math.round(total * 100) / 100;

  // Check data hygiene
  const hasChicks = expenseTxs.some((t) => t.category.toLowerCase().includes("chick"));
  const hasFeed = expenseTxs.some((t) => t.category.toLowerCase().includes("feed"));

  if (!hasChicks && transactions.length > 0) {
    missingInputs.push("chickPurchaseCost");
    assumptions.push("Chick procurement cost not yet recorded in expenses");
  }
  if (!hasFeed && transactions.length > 0) {
    missingInputs.push("feedPurchaseCost");
    assumptions.push("No feed purchase records logged yet");
  }

  return {
    value: rounded,
    isEstimated: missingInputs.length > 0,
    assumptions,
    missingInputs,
  };
}

/**
 * 2. costPerBirdPlaced: totalCost / startingBirds.
 */
export function calculateCostPerBirdPlaced(
  totalCost: number,
  startingBirds: number
): CalculationResult<number> {
  if (startingBirds <= 0) {
    return {
      value: null,
      isEstimated: false,
      assumptions: [],
      missingInputs: ["startingBirds"],
      reason: "Starting bird count must be greater than zero",
    };
  }

  const value = Math.round((totalCost / startingBirds) * 100) / 100;
  return {
    value,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * 3. costPerSurvivingBird: totalCost / currentBirds (alive or sold at calculation time).
 */
export function calculateCostPerSurvivingBird(
  totalCost: number,
  currentBirds: number,
  startingBirds: number
): CalculationResult<number> {
  if (currentBirds <= 0) {
    return {
      value: null,
      isEstimated: false,
      assumptions: [],
      missingInputs: ["currentBirds"],
      reason: "No surviving birds recorded for this batch",
    };
  }

  const value = Math.round((totalCost / currentBirds) * 100) / 100;
  const isEstimated = startingBirds > 0 && currentBirds === startingBirds;
  const assumptions = isEstimated
    ? ["Assumes zero mortality since starting and current bird counts are identical"]
    : [];

  return {
    value,
    isEstimated,
    assumptions,
    missingInputs: [],
  };
}

/**
 * 4. mortalityRate: (startingBirds - currentBirds) / startingBirds * 100.
 */
export function calculateMortalityRate(
  startingBirds: number,
  currentBirds: number
): CalculationResult<number> {
  if (startingBirds <= 0) {
    return {
      value: null,
      isEstimated: false,
      assumptions: [],
      missingInputs: ["startingBirds"],
      reason: "Starting birds count must be greater than zero",
    };
  }

  const deaths = Math.max(0, startingBirds - currentBirds);
  const rate = Math.round(((deaths / startingBirds) * 100) * 100) / 100;

  return {
    value: rate,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * 5. estimatedMortalityLoss: deaths * assumedValuePerBird.
 * The assumption must always be shown and editable, never silently baked in.
 */
export function calculateEstimatedMortalityLoss(
  deaths: number,
  assumedValuePerBird: number = 135
): CalculationResult<number> {
  const safeDeaths = Math.max(0, deaths);
  const safeValue = Math.max(0, assumedValuePerBird);
  const loss = Math.round(safeDeaths * safeValue * 100) / 100;

  return {
    value: loss,
    isEstimated: true,
    assumptions: [`Estimated loss assuming average bird replacement value of ₹${safeValue}/bird`],
    missingInputs: [],
  };
}

/**
 * 6. feedCostShare: feedExpense / totalBatchCost * 100.
 */
export function calculateFeedCostShare(
  feedExpense: number,
  totalBatchCost: number
): CalculationResult<number> {
  if (totalBatchCost <= 0) {
    return {
      value: 0,
      isEstimated: false,
      assumptions: ["No batch expenses recorded yet"],
      missingInputs: [],
    };
  }

  const share = Math.round(((feedExpense / totalBatchCost) * 100) * 10) / 10;
  return {
    value: share,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * 7. revenue: Sum of all REVENUE transactions for the batch.
 */
export function calculateRevenue(
  transactions: TransactionLike[]
): CalculationResult<number> {
  const revenueTxs = transactions.filter((t) => t.type === "REVENUE");
  const total = revenueTxs.reduce((sum, t) => sum + normalizeAmount(t.amount), 0);
  const rounded = Math.round(total * 100) / 100;

  return {
    value: rounded,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * 8. grossMargin: revenue - totalBatchCost.
 */
export function calculateGrossMargin(
  revenue: number,
  totalBatchCost: number
): CalculationResult<number> {
  const margin = Math.round((revenue - totalBatchCost) * 100) / 100;
  return {
    value: margin,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * 9. breakEvenPrice:
 * Computes break-even per surviving bird and break-even per saleable kg.
 */
export function calculateBreakEvenPrice(
  totalCost: number,
  survivingBirds: number,
  saleableWeightKg?: number | null
): {
  perBird: CalculationResult<number>;
  perKg: CalculationResult<number>;
} {
  const perBird = calculateCostPerSurvivingBird(totalCost, survivingBirds, survivingBirds);

  let perKg: CalculationResult<number>;
  if (saleableWeightKg && saleableWeightKg > 0) {
    const value = Math.round((totalCost / saleableWeightKg) * 100) / 100;
    perKg = {
      value,
      isEstimated: false,
      assumptions: [],
      missingInputs: [],
    };
  } else {
    perKg = {
      value: null,
      isEstimated: false,
      assumptions: [],
      missingInputs: ["saleableWeightKg"],
      reason: "Saleable flock total weight (kg) not recorded",
    };
  }

  return { perBird, perKg };
}

/**
 * 10. feedConversionRatio:
 * STRICT REQUIREMENT: ONLY computed if actual weight-gain data exists;
 * otherwise explicitly return null with a reason, never fabricate a number.
 */
export function calculateFeedConversionRatio(
  totalFeedConsumedKg: number | null | undefined,
  totalWeightGainKg: number | null | undefined
): CalculationResult<number> {
  if (
    totalFeedConsumedKg === null ||
    totalFeedConsumedKg === undefined ||
    totalFeedConsumedKg <= 0 ||
    totalWeightGainKg === null ||
    totalWeightGainKg === undefined ||
    totalWeightGainKg <= 0
  ) {
    return {
      value: null,
      isEstimated: false,
      assumptions: [],
      missingInputs: ["weightGainKg"],
      reason: "Actual flock weight-gain data not recorded — FCR cannot be fabricated without bird weigh-ins",
    };
  }

  const fcr = Math.round((totalFeedConsumedKg / totalWeightGainKg) * 100) / 100;
  return {
    value: fcr,
    isEstimated: false,
    assumptions: [],
    missingInputs: [],
  };
}

/**
 * Human-readable label for transaction categories.
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    chicks: "Day-Old Chicks (ਚੂਚੇ)",
    "feed-starter": "Feed: Pre/Starter (ਸਟਾਰਟਰ ਫ਼ੀਡ)",
    "feed-grower": "Feed: Grower (ਗਰੋਅਰ ਫ਼ੀਡ)",
    "feed-finisher": "Feed: Finisher (ਫਿਨਿਸ਼ਰ ਫ਼ੀਡ)",
    medicine: "Medicines & Supplements (ਦਵਾਈਆਂ)",
    vaccine: "Vaccines (ਟੀਕਾਕਰਨ)",
    "vet-fee": "Veterinarian & Visit Fees (ਡਾਕਟਰ ਫ਼ੀਸ)",
    "lab-test": "Lab Diagnostic Tests (ਲੈਬ ਟੈਸਟ)",
    utilities: "Electricity, Diesel & Litter (ਬਿਜਲੀ / ਬਾਲਣ)",
    labour: "Shed Labour & Wages (ਮਜ਼ਦੂਰੀ)",
    "mortality-disposal": "Mortality & Waste Handling (ਨਿਪਟਾਰਾ)",
    "sales-birds": "Bird Lift / Sales (ਮੁਰਗੇ ਦੀ ਵਿਕਰੀ)",
    "sales-eggs": "Egg Sales (ਆਂਡਿਆਂ ਦੀ ਵਿਕਰੀ)",
    "sales-manure": "Manure / Litter Sales (ਖਾਦ ਵਿਕਰੀ)",
    "sales-byproduct": "Feed Bags & Byproducts (ਖ਼ਾਲੀ ਬੋਰੇ)",
    other: "Other Expense / Revenue (ਹੋਰ)",
  };
  return labels[category] || category;
}

/**
 * Compiles a full BatchEconomicsReport from raw batch records, transactions, and daily logs.
 */
export function buildBatchEconomicsReport(
  batch: BatchLike,
  transactions: TransactionLike[],
  dailyLogs: DailyLogLike[] = [],
  options: { assumedValuePerBird?: number } = {}
): BatchEconomicsReport {
  const assumedValuePerBird = options.assumedValuePerBird ?? 135;

  // 1. Sort transactions by date ascending
  const sortedTxs = [...transactions].sort((a, b) => {
    const da = new Date(a.date).getTime();
    const db = new Date(b.date).getTime();
    return da - db;
  });

  // 2. Compute mortality and current birds
  const startingBirds = batch.startingBirds || 0;
  let currentBirds = batch.currentBirds;

  // If daily logs are available and show more accurate cumulative mortality
  const logMortalityTotal = dailyLogs.reduce((sum, log) => sum + (log.mortality || 0), 0);
  if (logMortalityTotal > 0 && currentBirds === startingBirds) {
    currentBirds = Math.max(0, startingBirds - logMortalityTotal);
  }

  const deaths = Math.max(0, startingBirds - currentBirds);

  // 3. Core Deterministic Metrics
  const totalCostResult = calculateTotalBatchCost(sortedTxs);
  const totalCost = totalCostResult.value ?? 0;

  // Filter feed expenses
  const feedTxs = sortedTxs.filter(
    (t) => t.type === "EXPENSE" && t.category.toLowerCase().startsWith("feed")
  );
  const feedExpenseVal = feedTxs.reduce((sum, t) => sum + normalizeAmount(t.amount), 0);
  const feedExpenseResult: CalculationResult<number> = {
    value: Math.round(feedExpenseVal * 100) / 100,
    isEstimated: false,
    assumptions: [],
    missingInputs: feedTxs.length === 0 ? ["feedPurchase"] : [],
  };

  const feedCostShareResult = calculateFeedCostShare(feedExpenseVal, totalCost);
  const costPerBirdPlacedResult = calculateCostPerBirdPlaced(totalCost, startingBirds);
  const costPerSurvivingBirdResult = calculateCostPerSurvivingBird(totalCost, currentBirds, startingBirds);
  const mortalityRateResult = calculateMortalityRate(startingBirds, currentBirds);
  const estimatedMortalityLossResult = calculateEstimatedMortalityLoss(deaths, assumedValuePerBird);
  const revenueResult = calculateRevenue(sortedTxs);
  const revenueVal = revenueResult.value ?? 0;
  const grossMarginResult = calculateGrossMargin(revenueVal, totalCost);
  const breakEvenResult = calculateBreakEvenPrice(totalCost, currentBirds);

  // Calculate Feed Intake from Logs or Purchases
  const totalFeedKgFromLogs = dailyLogs.reduce((sum, l) => sum + (l.feedKg || 0), 0);
  // FCR: Checked strictly for live weight gain
  const fcrResult = calculateFeedConversionRatio(
    totalFeedKgFromLogs > 0 ? totalFeedKgFromLogs : null,
    null // Weight gain data not yet logged in standard daily logs
  );

  // 4. Category Breakdown
  const categoryMap = new Map<string, { type: "EXPENSE" | "REVENUE"; amount: number; count: number }>();
  for (const tx of sortedTxs) {
    const key = `${tx.type}:${tx.category}`;
    const prev = categoryMap.get(key) || { type: tx.type, amount: 0, count: 0 };
    prev.amount += normalizeAmount(tx.amount);
    prev.count += 1;
    categoryMap.set(key, prev);
  }

  const categoryBreakdown: CategorySummaryItem[] = [];
  categoryMap.forEach((val, key) => {
    const [, category] = key.split(":");
    const baseTotal = val.type === "EXPENSE" ? totalCost : revenueVal;
    const percentageOfTotal =
      baseTotal > 0 ? Math.round(((val.amount / baseTotal) * 100) * 10) / 10 : 0;

    categoryBreakdown.push({
      category,
      categoryLabel: getCategoryLabel(category),
      type: val.type,
      amount: Math.round(val.amount * 100) / 100,
      percentageOfTotal,
      transactionCount: val.count,
    });
  });

  // Sort breakdown descending by amount
  categoryBreakdown.sort((a, b) => b.amount - a.amount);

  // 5. Daily Cumulative Timeline
  const dailyMap = new Map<string, { expense: number; revenue: number }>();
  for (const tx of sortedTxs) {
    const dateStr = new Date(tx.date).toISOString().slice(0, 10);
    const dayData = dailyMap.get(dateStr) || { expense: 0, revenue: 0 };
    const amt = normalizeAmount(tx.amount);
    if (tx.type === "EXPENSE") dayData.expense += amt;
    if (tx.type === "REVENUE") dayData.revenue += amt;
    dailyMap.set(dateStr, dayData);
  }

  const sortedDates = Array.from(dailyMap.keys()).sort();
  let runningCost = 0;
  let runningRevenue = 0;
  const timelineTrend: DailyExpenseTrendItem[] = sortedDates.map((dateStr) => {
    const day = dailyMap.get(dateStr)!;
    runningCost += day.expense;
    runningRevenue += day.revenue;
    return {
      date: dateStr,
      dailyExpense: Math.round(day.expense * 100) / 100,
      dailyRevenue: Math.round(day.revenue * 100) / 100,
      cumulativeCost: Math.round(runningCost * 100) / 100,
      cumulativeRevenue: Math.round(runningRevenue * 100) / 100,
    };
  });

  // Calculate flock age
  const placed = new Date(batch.placementDate);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24));
  const flockAgeDays = Math.max(1, diffDays + 1);

  // Clean mapped transactions
  const mappedTransactions: TransactionRecord[] = sortedTxs.map((tx) => ({
    id: tx.id || `tx_${Math.random()}`,
    batchId: batch.id,
    type: tx.type,
    category: tx.category,
    amount: normalizeAmount(tx.amount),
    quantity: tx.quantity ?? null,
    unit: tx.unit ?? null,
    note: tx.note ?? null,
    date: tx.date,
    createdAt: tx.createdAt || tx.date,
  }));

  return {
    batchId: batch.id,
    batchName: batch.farm?.name ? `${batch.farm.name} - Batch` : `Batch ${batch.id.slice(-4)}`,
    birdType: batch.birdType,
    breed: batch.breed,
    productionType: batch.productionType,
    placementDate: batch.placementDate,
    status: batch.status,
    flockAgeDays,
    startingBirds,
    currentBirds,
    mortalityCount: deaths,
    mortalityRate: mortalityRateResult,
    totalBatchCost: totalCostResult,
    feedExpense: feedExpenseResult,
    feedCostShare: feedCostShareResult,
    costPerBirdPlaced: costPerBirdPlacedResult,
    costPerSurvivingBird: costPerSurvivingBirdResult,
    assumedValuePerBird,
    estimatedMortalityLoss: estimatedMortalityLossResult,
    revenue: revenueResult,
    grossMargin: grossMarginResult,
    breakEvenPricePerBird: breakEvenResult.perBird,
    breakEvenPricePerKg: breakEvenResult.perKg,
    feedConversionRatio: fcrResult,
    categoryBreakdown,
    timelineTrend,
    transactions: mappedTransactions,
  };
}
