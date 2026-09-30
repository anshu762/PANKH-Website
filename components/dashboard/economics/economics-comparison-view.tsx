"use client";

import React from "react";
import { GitCompare, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { BatchComparisonItem } from "@/types/economics";
import { cn } from "@/lib/utils";

interface EconomicsComparisonViewProps {
  comparison: BatchComparisonItem;
}

export function EconomicsComparisonView({ comparison }: EconomicsComparisonViewProps) {
  const { currentBatch, previousBatch, deltas } = comparison;

  if (!previousBatch) {
    return (
      <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 text-center space-y-2">
        <GitCompare className="h-6 w-6 text-indigo-700 mx-auto" />
        <h4 className="font-serif text-sm font-bold text-pankh-clay">
          No Closed Batch Available for Comparison
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Batch-to-batch historical comparison becomes active once your first flock cycle closes.
        </p>
      </div>
    );
  }

  const renderDelta = (
    delta: number | null,
    unit: string = "",
    isPositiveGood: boolean = true
  ) => {
    if (delta === null || delta === undefined || delta === 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold text-stone-500">
          <Minus className="h-3 w-3" /> Same
        </span>
      );
    }

    const isGood = isPositiveGood ? delta > 0 : delta < 0;
    const isUp = delta > 0;

    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full border",
          isGood
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
        )}
      >
        {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        {isUp ? "+" : ""}
        {delta}
        {unit}
      </span>
    );
  };

  const rows = [
    {
      label: "Starting Flock Size",
      current: `${currentBatch.startingBirds.toLocaleString("en-IN")} birds`,
      previous: `${previousBatch.startingBirds.toLocaleString("en-IN")} birds`,
      delta: renderDelta(
        currentBatch.startingBirds - previousBatch.startingBirds,
        " birds",
        true
      ),
    },
    {
      label: "Mortality Rate (%)",
      current: `${currentBatch.mortalityRate.value ?? 0}%`,
      previous: `${previousBatch.mortalityRate.value ?? 0}%`,
      delta: renderDelta(deltas?.mortalityRateDiff ?? null, "%", false), // lower mortality is good
    },
    {
      label: "Total Batch Cost",
      current: `₹${(currentBatch.totalBatchCost.value ?? 0).toLocaleString("en-IN")}`,
      previous: `₹${(previousBatch.totalBatchCost.value ?? 0).toLocaleString("en-IN")}`,
      delta: renderDelta(deltas?.totalCostDiff ?? null, "₹", false), // lower cost is good
    },
    {
      label: "Cost / Bird Placed",
      current: currentBatch.costPerBirdPlaced.value !== null ? `₹${currentBatch.costPerBirdPlaced.value.toFixed(2)}` : "—",
      previous: previousBatch.costPerBirdPlaced.value !== null ? `₹${previousBatch.costPerBirdPlaced.value.toFixed(2)}` : "—",
      delta: renderDelta(deltas?.costPerBirdPlacedDiff ?? null, "₹", false),
    },
    {
      label: "Cost / Surviving Bird",
      current: currentBatch.costPerSurvivingBird.value !== null ? `₹${currentBatch.costPerSurvivingBird.value.toFixed(2)}` : "—",
      previous: previousBatch.costPerSurvivingBird.value !== null ? `₹${previousBatch.costPerSurvivingBird.value.toFixed(2)}` : "—",
      delta: renderDelta(deltas?.costPerSurvivingBirdDiff ?? null, "₹", false),
    },
    {
      label: "Feed Cost Share",
      current: `${currentBatch.feedCostShare.value ?? 0}%`,
      previous: `${previousBatch.feedCostShare.value ?? 0}%`,
      delta: renderDelta(deltas?.feedCostShareDiff ?? null, "%", false),
    },
    {
      label: "Total Revenue",
      current: `₹${(currentBatch.revenue.value ?? 0).toLocaleString("en-IN")}`,
      previous: `₹${(previousBatch.revenue.value ?? 0).toLocaleString("en-IN")}`,
      delta: renderDelta(deltas?.revenueDiff ?? null, "₹", true),
    },
    {
      label: "Net Gross Margin",
      current: `₹${(currentBatch.grossMargin.value ?? 0).toLocaleString("en-IN")}`,
      previous: `₹${(previousBatch.grossMargin.value ?? 0).toLocaleString("en-IN")}`,
      delta: renderDelta(deltas?.grossMarginDiff ?? null, "₹", true),
    },
  ];

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-900">
          <GitCompare className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
            Batch-to-Batch Comparison
          </h3>
          <p className="text-[11px] text-stone-500">
            Current Batch vs Previous Closed Batch ({previousBatch.breed})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Metric</th>
              <th className="py-2.5 px-3">Current Batch</th>
              <th className="py-2.5 px-3">Previous Batch</th>
              <th className="py-2.5 px-3 text-right">Difference (Delta)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-stone-50/80 transition-colors">
                <td className="py-2.5 px-3 font-semibold text-stone-800">
                  {row.label}
                </td>
                <td className="py-2.5 px-3 font-mono font-bold text-pankh-clay">
                  {row.current}
                </td>
                <td className="py-2.5 px-3 font-mono text-stone-600">
                  {row.previous}
                </td>
                <td className="py-2.5 px-3 text-right whitespace-nowrap">
                  {row.delta}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
