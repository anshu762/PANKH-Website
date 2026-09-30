"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EconomicsDashboardData } from "@/types/economics";
import { EconomicsHeader } from "./economics-header";
import { EconomicsSummaryCards } from "./economics-summary-cards";
import { EconomicsCharts } from "./economics-charts";
import { EconomicsInsightsList } from "./economics-insights-list";
import { EconomicsTransactionTable } from "./economics-transaction-table";
import { EconomicsComparisonView } from "./economics-comparison-view";
import { getEconomicsDashboardData } from "@/actions/economics";
import { Layers } from "lucide-react";

interface EconomicsDashboardViewProps {
  initialData: EconomicsDashboardData;
}

export function EconomicsDashboardView({ initialData }: EconomicsDashboardViewProps) {
  const router = useRouter();
  const [data, setData] = useState<EconomicsDashboardData>(initialData);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(
    initialData.activeBatchId || initialData.batches[0]?.id || null
  );
  const [assumedValue, setAssumedValue] = useState<number>(135);
  const [showComparison, setShowComparison] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBatchData = async (bId: string, assumedVal: number) => {
    setIsLoading(true);
    const res = await getEconomicsDashboardData(bId, assumedVal);
    setIsLoading(false);
    if (res.success && res.data) {
      setData(res.data);
    }
  };

  const handleBatchChange = (newBatchId: string) => {
    setActiveBatchId(newBatchId);
    fetchBatchData(newBatchId, assumedValue);
  };

  const handleAssumedValueChange = (newVal: number) => {
    setAssumedValue(newVal);
    if (activeBatchId) {
      fetchBatchData(activeBatchId, newVal);
    }
  };

  const handleRefresh = () => {
    if (activeBatchId) {
      fetchBatchData(activeBatchId, assumedValue);
    }
  };

  const { report, insights, comparison, batches } = data;

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-indigo-800">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="font-serif text-xl font-bold text-pankh-clay">
          No Flock Batch Found
        </h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Please complete farm onboarding or add a flock batch before viewing the economics ledger.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Module Header & Batch Navigation */}
      <EconomicsHeader
        batches={batches}
        activeBatchId={activeBatchId}
        onBatchChange={handleBatchChange}
        showComparison={showComparison}
        onToggleComparison={() => setShowComparison(!showComparison)}
        hasPreviousBatch={Boolean(comparison?.previousBatch)}
      />

      {/* 2. Four Ledger Metric Summary Cards */}
      <EconomicsSummaryCards
        report={report}
        onAssumedValueChange={handleAssumedValueChange}
      />

      {/* 3. Optional Side-by-Side Batch-to-Batch Comparison */}
      {showComparison && comparison && (
        <EconomicsComparisonView comparison={comparison} />
      )}

      {/* 4. Recharts Visual Analytics (Category & Timeline) */}
      <EconomicsCharts report={report} />

      {/* 5. Rule-Based Deterministic Financial Insights */}
      <EconomicsInsightsList insights={insights} report={report} />

      {/* 6. Filterable Transaction History Table with Edit & Delete */}
      <EconomicsTransactionTable
        transactions={report.transactions}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
