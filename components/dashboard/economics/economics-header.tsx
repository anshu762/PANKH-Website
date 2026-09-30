"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Plus,
  ArrowLeft,
  GitCompare,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { BatchOption } from "@/types/economics";
import { cn } from "@/lib/utils";

interface EconomicsHeaderProps {
  batches: BatchOption[];
  activeBatchId: string | null;
  onBatchChange: (batchId: string) => void;
  showComparison: boolean;
  onToggleComparison: () => void;
  hasPreviousBatch: boolean;
}

export function EconomicsHeader({
  batches,
  activeBatchId,
  onBatchChange,
  showComparison,
  onToggleComparison,
  hasPreviousBatch,
}: EconomicsHeaderProps) {
  const { t } = useLanguage();
  const d = t.economics;

  const currentBatch = batches.find((b) => b.id === activeBatchId) || batches[0];

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 font-bold text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />
                {d.badge}
              </span>
              {currentBatch?.status === "ACTIVE" ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  {d.activeBatchBadge}
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
                  {d.closedBatchBadge}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay mt-1">
              {d.title}
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-0.5 max-w-xl">
              {d.subtitle}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {hasPreviousBatch && (
            <button
              onClick={onToggleComparison}
              type="button"
              className={cn(
                "inline-flex items-center gap-2 h-11 px-4 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                showComparison
                  ? "bg-indigo-900 text-white border-indigo-950 shadow-xs"
                  : "bg-white hover:bg-stone-50 border-stone-300 text-stone-800 shadow-2xs"
              )}
            >
              <GitCompare className="h-4 w-4" />
              <span>{showComparison ? d.hideComparisonBtn : d.compareBatchesBtn}</span>
            </button>
          )}

          <Link
            href="/dashboard/economics/add"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>{d.addEntryBtn}</span>
          </Link>
        </div>
      </div>

      {/* Batch Switcher Bar */}
      {batches.length > 1 && (
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <Layers className="h-4 w-4 text-indigo-700 shrink-0" />
          <span className="text-xs font-bold text-stone-700 shrink-0">
            {d.batchSelectorLabel}:
          </span>
          <div className="relative flex-1 max-w-sm">
            <select
              value={activeBatchId || ""}
              onChange={(e) => onBatchChange(e.target.value)}
              className="w-full appearance-none bg-stone-50 hover:bg-stone-100 border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer pr-8"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.startingBirds} birds) — {b.status}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      )}
    </div>
  );
}
