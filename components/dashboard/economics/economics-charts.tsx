"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
  Cell,
} from "recharts";
import { PieChart, TrendingUp, BarChart2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { BatchEconomicsReport } from "@/types/economics";

interface EconomicsChartsProps {
  report: BatchEconomicsReport;
}

const CATEGORY_COLORS = [
  "#1E1B4B", // Night Indigo
  "#D97706", // Sarson Marigold
  "#059669", // Sentinel Emerald
  "#EA580C", // Phulkari Vermilion
  "#0284C7", // Canal Blue
  "#7C3AED", // Royal Violet
  "#6B7280", // Slate Stone
];

export function EconomicsCharts({ report }: EconomicsChartsProps) {
  const { t } = useLanguage();
  const d = t.economics;

  // Filter only expense categories for the expenditure breakdown chart
  const expenseCategories = report.categoryBreakdown
    .filter((c) => c.type === "EXPENSE")
    .map((c) => ({
      name: c.categoryLabel.split("(")[0].trim(),
      amount: c.amount,
      percentage: c.percentageOfTotal,
    }));

  const timelineData = report.timelineTrend.map((t) => ({
    date: new Date(t.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    }),
    dailySpend: t.dailyExpense,
    cumulativeSpend: t.cumulativeCost,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
      {/* 1. Category Expenditure Distribution */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-800">
              <PieChart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
                {d.chartCategoryTitle}
              </h3>
              <p className="text-[11px] text-stone-500">
                {d.chartCategorySubtitle}
              </p>
            </div>
          </div>
        </div>

        {expenseCategories.length > 0 ? (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={expenseCategories}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#374151" }}
                  width={110}
                />
                <Tooltip
                  formatter={(val: any, name: any, item: any) => [
                    `₹${Number(val).toLocaleString("en-IN")} (${item.payload.percentage}%)`,
                    "Expenditure",
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                  {expenseCategories.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <BarChart2 className="h-10 w-10 stroke-1 mb-2 text-stone-300" />
            <p className="text-xs">{d.noTransactions}</p>
          </div>
        )}
      </div>

      {/* 2. Cumulative Spend Timeline */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-800">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
                {d.chartTimelineTitle}
              </h3>
              <p className="text-[11px] text-stone-500">
                {d.chartTimelineSubtitle}
              </p>
            </div>
          </div>
        </div>

        {timelineData.length > 0 ? (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={timelineData}
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E1B4B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#1E1B4B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <YAxis
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  tick={{ fontSize: 11, fill: "#6B7280" }}
                />
                <Tooltip
                  formatter={(val: any, name: string) => [
                    `₹${Number(val).toLocaleString("en-IN")}`,
                    name === "cumulativeSpend" ? d.cumulativeSpend : d.dailyExpense,
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulativeSpend"
                  stroke="#1E1B4B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#spendGradient)"
                />
                <Bar
                  dataKey="dailySpend"
                  fill="#D97706"
                  opacity={0.7}
                  radius={[4, 4, 0, 0]}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <TrendingUp className="h-10 w-10 stroke-1 mb-2 text-stone-300" />
            <p className="text-xs">{d.noTransactions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
