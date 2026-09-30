"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Shield,
  PieChart,
  BarChart3,
  DollarSign,
  AlertCircle,
  Filter,
  Layers,
  MapPin,
  Building,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { AdminEconomicsAnalyticsData } from "@/types/admin";
import { cn } from "@/lib/utils";

interface EconomicsAnalyticsViewProps {
  initialData: AdminEconomicsAnalyticsData;
}

const CATEGORY_COLORS = [
  "#D97706", // Feed (Sarson Amber)
  "#1E1B4B", // Chicks (Night Indigo)
  "#059669", // Health/Vaccines (Emerald)
  "#0284C7", // Utilities (Canal Blue)
  "#7C3AED", // Labour (Royal Violet)
  "#EA580C", // Disposal (Vermilion)
  "#6B7280", // Other
];

export function EconomicsAnalyticsView({ initialData }: EconomicsAnalyticsViewProps) {
  const [data] = useState<AdminEconomicsAnalyticsData>(initialData);
  const [selectedDistrict, setSelectedDistrict] = useState<string>("ALL");

  // Unique districts for filter
  const districts = Array.from(
    new Set(data.anonymizedBatchSummaries.map((b) => b.district).filter(Boolean))
  );

  const filteredBatches = data.anonymizedBatchSummaries.filter((b) => {
    if (selectedDistrict === "ALL") return true;
    return b.district === selectedDistrict;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              Regional Economics Analytics & Macro Benchmarks
            </h1>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
              <Shield className="w-3 h-3" />
              Privacy-Preserving (Zero PII)
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Aggregated cost structures and benchmark metrics across poultry operations in Punjab.
          </p>
        </div>

        {/* District Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            <option value="ALL">All Districts ({data.anonymizedBatchSummaries.length} flocks)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Strict Privacy Banner */}
      <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-start gap-3 text-xs text-muted-foreground">
        <Shield className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Section 11 Strict Farmer Privacy Guarantee: </span>
          Farmer identities, phone numbers, and individual farm locations are strictly redacted from this analytics layer.
          All benchmarks are aggregated at regional and anonymized flock levels (`Flock-XXXX`) to identify input inflation and statewide efficiency trends.
        </div>
      </div>

      {/* Macro Benchmark KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Feed Cost Share */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Avg Feed Cost Share</span>
            <span className="text-amber-500 font-bold">Punjab Avg</span>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {data.averageFeedCostShare}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            Expected benchmark: 65% – 72%
          </p>
        </div>

        {/* Cost Per Bird Placed */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Avg Cost / Placed</span>
            <span className="text-primary font-bold">Base</span>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            ₹{data.averageCostPerBirdPlaced}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Total batch spend / initial birds
          </p>
        </div>

        {/* Cost Per Surviving Bird */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Avg Cost / Surviving</span>
            <span className="text-emerald-500 font-bold">True</span>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            ₹{data.averageCostPerSurvivingBird}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Carries cost of mortalities
          </p>
        </div>

        {/* Regional Mortality */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Avg Batch Mortality</span>
            <span className="text-foreground font-bold">Rate</span>
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {data.averageMortalityRate}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            Across {data.totalBatchesAnalyzed} tracked batches
          </p>
        </div>
      </div>

      {/* Aggregate Volume & Spend Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">
              Total Recorded Poultry Volume
            </span>
            <div className="text-2xl font-mono font-bold text-foreground">
              {data.totalVolumeBirds.toLocaleString("en-IN")} Birds
            </div>
            <p className="text-[11px] text-muted-foreground">
              Combined flock size across Punjab batches
            </p>
          </div>
          <Building className="w-8 h-8 text-primary/30" />
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">
              Total Input Expenditure Tracked
            </span>
            <div className="text-2xl font-mono font-bold text-foreground">
              ₹{data.totalSpendTracked.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Combined ledger expenses recorded
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-emerald-500/40" />
        </div>
      </div>

      {/* Category Spend Distribution Chart */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Statewide Input Cost Breakdown (Aggregated)
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {data.categoryBreakdown.length} Expense Categories
          </span>
        </div>

        <div className="h-64 w-full">
          {data.categoryBreakdown.length === 0 ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
              No expense transactions recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.categoryBreakdown}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Total Spend"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                  {data.categoryBreakdown.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Anonymized Batch Benchmarking Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Anonymized Flock Comparison ({filteredBatches.length} Batches)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            Zero PII Displayed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-mono text-[11px]">
              <tr>
                <th className="px-4 py-3">Flock Code</th>
                <th className="px-4 py-3">District</th>
                <th className="px-4 py-3">Bird & Type</th>
                <th className="px-4 py-3 text-right">Feed Cost %</th>
                <th className="px-4 py-3 text-right">Cost / Placed</th>
                <th className="px-4 py-3 text-right">Cost / Surviving</th>
                <th className="px-4 py-3 text-right">Mortality %</th>
                <th className="px-4 py-3 text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    No batches found for the selected district filter.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b.batchIdShort} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-foreground">
                      {b.batchIdShort}
                    </td>
                    <td className="px-4 py-3 text-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      {b.district}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <span className="font-medium text-foreground">{b.birdType}</span>
                      <span className="text-[10px] ml-1">({b.productionType})</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium">
                      <span
                        className={cn(
                          b.feedCostShare > 75
                            ? "text-red-500 font-bold"
                            : b.feedCostShare > 70
                            ? "text-amber-500"
                            : "text-foreground"
                        )}
                      >
                        {b.feedCostShare > 0 ? `${b.feedCostShare}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-foreground">
                      {b.costPerBirdPlaced > 0 ? `₹${b.costPerBirdPlaced}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-medium text-foreground">
                      {b.costPerSurvivingBird > 0 ? `₹${b.costPerSurvivingBird}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      <span
                        className={cn(
                          b.mortalityRate > 6
                            ? "text-red-500 font-bold"
                            : b.mortalityRate > 4
                            ? "text-amber-500"
                            : "text-foreground"
                        )}
                      >
                        {b.mortalityRate > 0 ? `${b.mortalityRate}%` : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">
                      ₹{b.totalSpend.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
