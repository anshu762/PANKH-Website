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
  Warehouse,
  Coins,
  ShieldCheck,
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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Strict Zero-PII Privacy Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-indigo-900 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-indigo-950">
          <p className="font-bold font-serif text-sm">
            Hard Safety Rule 5 & Strict Farmer Privacy Guarantee (Zero PII)
          </p>
          <p className="leading-relaxed text-stone-700">
            Farmer identities, phone numbers, and exact shed locations are strictly redacted from this regional macro analytics layer.
            Financial figures are labeled with explicit assumptions (e.g. estimated cost/bird). All benchmarks are aggregated across anonymized flock cycles (`Flock-XXXX`) to detect feed inflation and input trends across Punjab.
          </p>
        </div>
      </div>

      {/* 2. Top Controls & District Filter */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              Regional Farm Economics Benchmarks
            </h3>
            <p className="text-[11px] text-stone-500">
              Aggregated across {data.totalBatchesAnalyzed} active & historical commercial batches
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5 text-stone-400" />
          <span className="text-xs font-bold text-stone-600 font-mono">
            District:
          </span>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-sans"
          >
            <option value="ALL">All Punjab Districts ({data.anonymizedBatchSummaries.length} flocks)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Macro Benchmark KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Feed Cost Share */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-amber-900">
              Avg Feed Share
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
              Punjab
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-pankh-clay">
            {data.averageFeedCostShare}%
          </div>
          <p className="text-[11px] text-stone-500">
            Expected benchmark: 65% – 72%
          </p>
        </div>

        {/* Cost Per Bird Placed */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-indigo-900">
              Avg Cost / Placed
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold border border-indigo-200">
              Base
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-pankh-clay">
            ₹{data.averageCostPerBirdPlaced}
          </div>
          <p className="text-[11px] text-stone-500">
            Total batch spend / initial birds
          </p>
        </div>

        {/* Cost Per Surviving Bird */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-emerald-900">
              Avg Cost / Surviving
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
              True
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700">
            ₹{data.averageCostPerSurvivingBird}
          </div>
          <p className="text-[11px] text-stone-500">
            Carries cost of flock mortality
          </p>
        </div>

        {/* Regional Mortality */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-red-900">
              Avg Batch Mortality
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold border border-red-300">
              Rate
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-red-700">
            {data.averageMortalityRate}%
          </div>
          <p className="text-[11px] text-stone-500">
            Across {data.totalBatchesAnalyzed} tracked batches
          </p>
        </div>
      </div>

      {/* 4. Aggregate Volume & Total Spend Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-stone-500 font-bold">
              Total Recorded Poultry Volume
            </span>
            <div className="text-3xl font-mono font-bold text-pankh-clay">
              {data.totalVolumeBirds.toLocaleString("en-IN")}{" "}
              <span className="text-base font-sans font-normal text-stone-500">Birds</span>
            </div>
            <p className="text-[11px] text-stone-500">
              Combined flock size across commercial sheds
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 flex items-center justify-center">
            <Warehouse className="h-6 w-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase text-stone-500 font-bold">
              Total Input Expenditure Tracked
            </span>
            <div className="text-3xl font-mono font-bold text-emerald-700">
              ₹{data.totalSpendTracked.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-stone-500">
              Recorded across feed, chicks, health, and utilities
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 flex items-center justify-center">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* 5. Category Spend Distribution Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Input Cost Breakdown Composition
              </h3>
              <p className="text-[11px] text-stone-500">
                Expenditure breakdown across major input categories in INR (₹)
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.categoryBreakdown}
              margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11, fill: "#78716C", fontFamily: "sans-serif" }}
                axisLine={{ stroke: "#E7E5E4" }}
                tickLine={false}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#78716C", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(val: number) => [`₹${val.toLocaleString("en-IN")}`, "Total Spend"]}
                contentStyle={{
                  backgroundColor: "#FAF9F5",
                  borderColor: "#E7E5E4",
                  borderRadius: "1rem",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              />
              <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                {data.categoryBreakdown.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 6. Anonymized Flock Summaries Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-800">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Anonymized Flock Cohort Records ({filteredBatches.length})
              </h3>
              <p className="text-[11px] text-stone-500">
                Redacted flock profiles for input cost and feed efficiency auditing
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-3">Flock Code</th>
                <th className="py-3 px-3">District</th>
                <th className="py-3 px-3">Flock Type</th>
                <th className="py-3 px-3">Total Spend</th>
                <th className="py-3 px-3">Mortality %</th>
                <th className="py-3 px-3">Feed Share</th>
                <th className="py-3 px-3">Cost / Placed</th>
                <th className="py-3 px-3 text-right">Cost / Surviving</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-xs">
              {filteredBatches.map((b, idx) => (
                <tr key={idx} className="hover:bg-[#FAF9F5]/70 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-pankh-clay">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-stone-800 text-[11px]">
                      {b.batchIdShort}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-sans text-stone-700">
                    {b.district}
                  </td>
                  <td className="py-3.5 px-3 text-stone-700 font-sans">
                    {b.birdType} ({b.productionType})
                  </td>
                  <td className="py-3.5 px-3 text-stone-900 font-bold">
                    ₹{b.totalSpend.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-3">
                    <span
                      className={cn(
                        "px-1.5 py-0.5 rounded font-bold text-[10px]",
                        b.mortalityRate > 5
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {b.mortalityRate}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-amber-800 font-bold">
                    {b.feedCostShare}%
                  </td>
                  <td className="py-3.5 px-3 text-stone-700">
                    ₹{b.costPerBirdPlaced}
                  </td>
                  <td className="py-3.5 px-3 text-right font-bold text-emerald-700">
                    ₹{b.costPerSurvivingBird}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
