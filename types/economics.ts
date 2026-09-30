export type TransactionType = "EXPENSE" | "REVENUE";

export type ExpenseCategory =
  | "chicks"
  | "feed-starter"
  | "feed-grower"
  | "feed-finisher"
  | "medicine"
  | "vaccine"
  | "vet-fee"
  | "lab-test"
  | "utilities"
  | "labour"
  | "mortality-disposal"
  | "other";

export type RevenueCategory =
  | "sales-birds"
  | "sales-eggs"
  | "sales-manure"
  | "sales-byproduct"
  | "other";

export type AllTransactionCategory = ExpenseCategory | RevenueCategory;

export interface CalculationResult<T = number> {
  value: T | null;
  isEstimated: boolean;
  assumptions: string[];
  missingInputs: string[];
  reason?: string;
}

export interface TransactionRecord {
  id: string;
  batchId: string;
  type: TransactionType;
  category: string;
  amount: number;
  quantity?: number | null;
  unit?: string | null;
  note?: string | null;
  date: Date | string;
  createdAt: Date | string;
}

export interface CategorySummaryItem {
  category: string;
  categoryLabel: string;
  type: TransactionType;
  amount: number;
  percentageOfTotal: number;
  transactionCount: number;
}

export interface DailyExpenseTrendItem {
  date: string; // YYYY-MM-DD
  dailyExpense: number;
  dailyRevenue: number;
  cumulativeCost: number;
  cumulativeRevenue: number;
}

export interface BatchEconomicsReport {
  batchId: string;
  batchName?: string;
  birdType: string;
  breed: string;
  productionType: "BROILER" | "LAYER";
  placementDate: Date | string;
  status: "ACTIVE" | "CLOSED";
  flockAgeDays: number;
  startingBirds: number;
  currentBirds: number;
  mortalityCount: number;
  
  // Deterministic calculation results
  mortalityRate: CalculationResult<number>;
  totalBatchCost: CalculationResult<number>;
  feedExpense: CalculationResult<number>;
  feedCostShare: CalculationResult<number>;
  costPerBirdPlaced: CalculationResult<number>;
  costPerSurvivingBird: CalculationResult<number>;
  assumedValuePerBird: number;
  estimatedMortalityLoss: CalculationResult<number>;
  revenue: CalculationResult<number>;
  grossMargin: CalculationResult<number>;
  breakEvenPricePerBird: CalculationResult<number>;
  breakEvenPricePerKg: CalculationResult<number>;
  feedConversionRatio: CalculationResult<number>;

  // Breakdowns and Trends
  categoryBreakdown: CategorySummaryItem[];
  timelineTrend: DailyExpenseTrendItem[];
  transactions: TransactionRecord[];
}

export interface EconomicsInsight {
  id: string;
  type: "cost_structure" | "mortality_loss" | "feed_efficiency" | "margin_alert" | "data_quality";
  severity: "info" | "warning" | "positive" | "urgent";
  headline: string;
  body: string;
  deterministicNumbers: Record<string, number | string>;
  isEstimated: boolean;
  assumptionLabel?: string;
}

export interface BatchComparisonItem {
  currentBatch: BatchEconomicsReport;
  previousBatch: BatchEconomicsReport | null;
  deltas: {
    totalCostDiff: number | null;
    costPerBirdPlacedDiff: number | null;
    costPerSurvivingBirdDiff: number | null;
    mortalityRateDiff: number | null;
    feedCostShareDiff: number | null;
    grossMarginDiff: number | null;
    revenueDiff: number | null;
  } | null;
}

export interface BatchOption {
  id: string;
  name: string;
  birdType: string;
  breed: string;
  startingBirds: number;
  status: "ACTIVE" | "CLOSED";
  placementDate: string;
}

export interface EconomicsDashboardData {
  report: BatchEconomicsReport | null;
  insights: EconomicsInsight[];
  comparison: BatchComparisonItem | null;
  batches: BatchOption[];
  activeBatchId: string | null;
}
