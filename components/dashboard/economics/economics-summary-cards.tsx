"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingUp,
  Percent,
  AlertTriangle,
  Scale,
  Edit2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { BatchEconomicsReport } from "@/types/economics";
import { cn } from "@/lib/utils";

interface EconomicsSummaryCardsProps {
  report: BatchEconomicsReport;
  onAssumedValueChange: (newValue: number) => void;
}

export function EconomicsSummaryCards({
  report,
  onAssumedValueChange,
}: EconomicsSummaryCardsProps) {
  const { t } = useLanguage();
  const d = t.economics;

  const [isEditingAssumption, setIsEditingAssumption] = useState(false);
  const [tempAssumedVal, setTempAssumedVal] = useState(report.assumedValuePerBird);

  const totalCost = report.totalBatchCost.value ?? 0;
  const feedCost = report.feedExpense.value ?? 0;
  const feedShare = report.feedCostShare.value ?? 0;
  const revenue = report.revenue.value ?? 0;
  const grossMargin = report.grossMargin.value ?? 0;
  const costPerPlaced = report.costPerBirdPlaced.value;
  const costPerSurviving = report.costPerSurvivingBird.value;
  const mortalityLoss = report.estimatedMortalityLoss.value ?? 0;
  const mortalityRate = report.mortalityRate.value ?? 0;
  const deaths = report.mortalityCount;
  const breakEvenBird = report.breakEvenPricePerBird.value;

  const handleSaveAssumption = () => {
    const val = Number(tempAssumedVal);
    if (!isNaN(val) && val > 0) {
      onAssumedValueChange(val);
    }
    setIsEditingAssumption(false);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {/* ======================================================== */}
      {/* 1. Total Batch Cost & Feed Share                         */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-indigo-200/90 bg-gradient-to-br from-indigo-50/40 via-white to-slate-50/50 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5 font-sans">
              <Wallet className="h-4 w-4 text-indigo-700" />
              {d.cardTotalCost}
            </span>
            {report.totalBatchCost.isEstimated ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                {d.incompleteBadge}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {d.verifiedBadge}
              </span>
            )}
          </div>

          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay font-mono">
              ₹{totalCost.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Recorded across {report.transactions.filter((t) => t.type === "EXPENSE").length} expense vouchers
            </p>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-indigo-100/80 flex items-center justify-between">
          <span className="text-xs text-stone-600 font-medium">
            {d.cardFeedShare}:
          </span>
          <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-amber-100 text-amber-950 border border-amber-200">
            {feedShare}% (₹{feedCost.toLocaleString("en-IN")})
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Revenue & Net Gross Margin                            */}
      {/* ======================================================== */}
      <div className={cn(
        "rounded-3xl border-2 p-5 sm:p-6 shadow-xs flex flex-col justify-between",
        grossMargin >= 0
          ? "border-emerald-200/90 bg-gradient-to-br from-emerald-50/40 via-white to-stone-50/40"
          : "border-stone-200 bg-gradient-to-br from-stone-50/60 via-white to-amber-50/30"
      )}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pankh-clay flex items-center gap-1.5 font-sans">
              <TrendingUp className="h-4 w-4 text-emerald-700" />
              {d.cardGrossMargin}
            </span>
            <span className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
              grossMargin >= 0
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            )}>
              {grossMargin >= 0 ? "Surplus" : "Cash Outlay"}
            </span>
          </div>

          <div>
            <div className={cn(
              "font-serif text-2xl sm:text-3xl font-bold font-mono",
              grossMargin >= 0 ? "text-emerald-800" : "text-pankh-clay"
            )}>
              {grossMargin >= 0 ? "+" : ""}₹{grossMargin.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {d.cardRevenue}: <strong className="text-pankh-clay font-mono">₹{revenue.toLocaleString("en-IN")}</strong>
            </p>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-stone-200/80 flex items-center justify-between">
          <span className="text-xs text-stone-600 font-medium">
            {d.breakEvenLabel}:
          </span>
          <span className="text-xs font-bold font-mono text-pankh-clay">
            {breakEvenBird ? `₹${breakEvenBird.toFixed(2)}/bird` : "—"}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. Cost Per Bird (Placed vs Surviving)                   */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-stone-200 bg-gradient-to-br from-stone-50/60 via-white to-stone-50/20 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-pankh-clay flex items-center gap-1.5 font-sans">
              <Scale className="h-4 w-4 text-stone-700" />
              {d.cardCostPerSurviving}
            </span>
            {report.costPerSurvivingBird.isEstimated ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                {d.estimatedBadge}
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {d.verifiedBadge}
              </span>
            )}
          </div>

          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay font-mono">
              {costPerSurviving !== null ? `₹${costPerSurviving.toFixed(2)}` : "—"}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              Active flock: <strong className="text-pankh-clay">{report.currentBirds.toLocaleString("en-IN")} birds</strong> remaining
            </p>
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-stone-200/80 flex items-center justify-between">
          <span className="text-xs text-stone-600 font-medium">
            {d.cardCostPerPlaced}:
          </span>
          <span className="text-xs font-bold font-mono text-stone-700">
            {costPerPlaced !== null ? `₹${costPerPlaced.toFixed(2)}/bird` : "—"}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Estimated Mortality Loss (Assumption Editable)        */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-red-200/90 bg-gradient-to-br from-red-50/40 via-white to-amber-50/20 p-5 sm:p-6 shadow-xs flex flex-col justify-between relative">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5 font-sans">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              {d.cardMortalityLoss}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-900 font-bold border border-red-200">
              {d.estimatedBadge}
            </span>
          </div>

          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-red-700 font-mono">
              ₹{mortalityLoss.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-stone-500 mt-1">
              {mortalityRate}% mortality ({deaths.toLocaleString("en-IN")} dead birds)
            </p>
          </div>
        </div>

        {/* Editable Assumption Box */}
        <div className="pt-3 mt-3 border-t border-red-100">
          {isEditingAssumption ? (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-stone-600">Assumed ₹/bird:</span>
                <input
                  type="number"
                  value={tempAssumedVal}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) =>
                    setTempAssumedVal(
                      Number(e.target.value.replace(/^0+(?=\d)/, ""))
                    )
                  }
                  className="w-16 px-1.5 py-0.5 text-xs font-mono border rounded bg-white"
                  min={1}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAssumption}
                  className="px-2 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-[10px] font-bold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingAssumption(false)}
                  className="px-2 py-1 bg-stone-200 text-stone-700 rounded text-[10px]"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-stone-600 font-medium">
                At ₹{report.assumedValuePerBird}/bird
              </span>
              <button
                type="button"
                onClick={() => setIsEditingAssumption(true)}
                className="text-[10px] font-bold text-red-700 hover:text-red-900 flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="h-3 w-3" />
                Change
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
