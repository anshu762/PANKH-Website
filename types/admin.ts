import { AlertSeverity, CaseStatus, VetLabType } from "@prisma/client";
import { FunnelMetrics, ActivityTrendItem } from "@/lib/analytics/track";

export interface AdminOverviewStats {
  totalFarmers: number;
  totalFarms: number;
  activeBatches: number;
  redAlertsCount: number;
  openCasesCount: number;
  pendingAiReviewsCount: number;
  verifiedVetCount: number;
  approvedKbSourcesCount: number;
}

export interface AdminFarmerListItem {
  id: string; // Farmer.id
  userId: string;
  name: string;
  email: string;
  phone: string;
  village: string;
  district: string;
  state: string;
  preferredLanguage: string;
  consentDataShare: boolean;
  consentMediaShare: boolean;
  adminNotes?: string | null;
  farmsCount: number;
  activeBatchesCount: number;
  createdAt: string;
}

export interface AdminFarmerDetail extends AdminFarmerListItem {
  farms: Array<{
    id: string;
    name: string;
    farmType: string;
    capacity: number;
    shedCount: number;
    ventilationType: string;
    batches: Array<{
      id: string;
      birdType: string;
      breed: string;
      productionType: string;
      startingBirds: number;
      currentBirds: number;
      status: string;
      placementDate: string;
    }>;
  }>;
  caseRecords: Array<{
    id: string;
    symptomsSummary: string;
    status: CaseStatus;
    createdAt: string;
    assignedVetLab?: {
      name: string;
      phone: string;
    } | null;
  }>;
}

export interface AdminHighRiskAlertItem {
  id: string;
  batchId: string;
  farmName: string;
  farmerName: string;
  farmerPhone: string;
  district: string;
  severity: AlertSeverity;
  reason: string;
  signalsTriggered: any;
  acknowledged: boolean;
  escalated: boolean;
  adminNotes?: string | null;
  createdAt: string;
  hoursAgo: number;
  linkedCase?: {
    id: string;
    status: CaseStatus;
    assignedVetLabName?: string | null;
  } | null;
}

export interface AdminVetLabItem {
  id: string;
  name: string;
  type: VetLabType;
  qualification?: string | null;
  verified: boolean;
  phone: string;
  whatsapp?: string | null;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
  serviceRadiusKm?: number | null;
  specializations: string[];
  teleconsult: boolean;
  hours?: string | null;
  createdAt: string;
}

export interface AdminKnowledgeSourceItem {
  id: string;
  title: string;
  authority: string;
  topic: string;
  language: string;
  version: string;
  url?: string | null;
  approved: boolean;
  chunkCount: number;
  chunks?: Array<{
    id: string;
    content: string;
    birdType?: string | null;
    tags: string[];
  }>;
  createdAt: string;
}

export interface AdminAlertRuleHistoryItem {
  id: string;
  previousValue: number;
  newValue: number;
  changedBy: string;
  changedAt: string;
}

export interface AdminAlertRuleItem {
  id: string;
  name: string;
  thresholdKey: string;
  thresholdValue: number;
  editable: boolean;
  updatedBy: string;
  updatedAt: string;
  history: AdminAlertRuleHistoryItem[];
}

export interface AdminAiReviewItem {
  id: string; // Message.id
  conversationId: string;
  farmerName: string;
  farmerPhone?: string | null;
  role: string;
  content: string;
  inputMode: string;
  sourceIds: string[];
  sourceTitles: string[];
  feedback?: string | null;
  createdAt: string;
  isNegativeFeedback: boolean;
  farmerQuestion?: string | null;
}

export interface AnonymizedEconomicsBatchSummary {
  batchIdShort: string;
  district: string;
  birdType: string;
  productionType: string;
  feedCostShare: number;
  costPerBirdPlaced: number;
  costPerSurvivingBird: number;
  mortalityRate: number;
  totalSpend: number;
  totalRevenue: number;
}

export interface AdminEconomicsAnalyticsData {
  averageFeedCostShare: number;
  averageCostPerBirdPlaced: number;
  averageCostPerSurvivingBird: number;
  averageMortalityRate: number;
  totalBatchesAnalyzed: number;
  totalVolumeBirds: number;
  totalSpendTracked: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  anonymizedBatchSummaries: AnonymizedEconomicsBatchSummary[];
}

export interface AdminSystemAnalyticsData {
  dau: number;
  wau: number;
  funnel: FunnelMetrics;
  activityTrend: ActivityTrendItem[];
}
