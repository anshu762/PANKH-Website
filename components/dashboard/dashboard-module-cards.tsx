"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  TrendingUp,
  Mic,
  ArrowRight,
  Clock,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface DashboardModuleCardsProps {
  batch: any;
  todayLog: any;
  latestAlert: any;
  recentLogs?: any[];
  economics: {
    totalSpend: number;
    totalRevenue: number;
    netMargin: number;
    estimatedCostPerBird?: number;
    costPerBirdPlaced?: number;
    feedCostShare?: number;
    isEstimated?: boolean;
    assumptions?: string[];
  };
}

export function DashboardModuleCards({
  batch,
  todayLog,
  latestAlert,
  recentLogs = [],
  economics,
}: DashboardModuleCardsProps) {
  const { t } = useLanguage();
  const d = t.dashboardHome;

  const alertSeverity = latestAlert?.severity || "GREEN";
  const isCheckedInToday = Boolean(todayLog);

  // Determine last check-in timestamp
  const lastLog = todayLog || (recentLogs && recentLogs[0]) || null;
  const lastCheckinFormatted = lastLog
    ? new Date(lastLog.date || lastLog.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
      {/* ======================================================== */}
      {/* 1. Pankh AI Assistant (Sarson Marigold Glow)             */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 text-amber-950 font-bold text-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              {d.askCard.badge}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              RAG Active
            </span>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
              {d.askCard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {d.askCard.subtitle}
            </p>
          </div>

          {/* Quick Voice / Text Helper Prompts */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block font-mono">
              {d.askCard.voicePrompt}
            </span>
            <div className="space-y-1.5">
              {[d.askCard.prompt1, d.askCard.prompt2, d.askCard.prompt3].map(
                (prompt, idx) => (
                  <Link
                    key={idx}
                    href="/dashboard/ask"
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/95 border border-amber-200/80 text-xs text-stone-700 hover:text-amber-950 hover:border-amber-400 transition-colors shadow-2xs font-medium group/item"
                  >
                    <span className="truncate">"{prompt}"</span>
                    <ChevronRight className="h-3.5 w-3.5 text-stone-400 group-hover/item:text-amber-700 shrink-0 ml-1.5" />
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        <div className="pt-5 mt-5 border-t border-amber-200/60">
          <Link
            href="/dashboard/ask"
            className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-marigold hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>{d.askCard.cta}</span>
            </div>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. Today's Flock Check / Sentinel (Tri-Status Monitor)   */}
      {/* ======================================================== */}
      <div
        className={cn(
          "rounded-3xl border-2 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between",
          alertSeverity === "RED"
            ? "border-red-500 bg-gradient-to-br from-red-50/80 via-white to-red-50/30"
            : alertSeverity === "AMBER"
            ? "border-amber-500 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30"
            : "border-emerald-500 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20"
        )}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs",
                alertSeverity === "RED"
                  ? "bg-red-100 text-red-900 border border-red-200"
                  : alertSeverity === "AMBER"
                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-200"
              )}
            >
              {alertSeverity === "RED" ? (
                <ShieldAlert className="h-3.5 w-3.5 text-red-700" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
              )}
              {d.sentinelCard.badge}
            </span>

            {/* Severity Status Indicator */}
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-1 rounded-lg font-mono",
                alertSeverity === "RED"
                  ? "bg-red-200 text-red-950 border border-red-300"
                  : alertSeverity === "AMBER"
                  ? "bg-amber-200 text-amber-950 border border-amber-300"
                  : "bg-emerald-200/80 text-emerald-950 border border-emerald-300"
              )}
            >
              {alertSeverity === "RED"
                ? d.sentinelCard.statusUrgent
                : alertSeverity === "AMBER"
                ? d.sentinelCard.statusWatch
                : d.sentinelCard.statusNormal}
            </span>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
              {d.sentinelCard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {d.sentinelCard.subtitle}
            </p>
          </div>

          {/* Daily Health Log State Card */}
          <div className="p-4 rounded-2xl border border-stone-200 bg-white/95 space-y-2">
            <div className="flex items-center gap-3">
              {isCheckedInToday ? (
                <div className="h-9 w-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="h-9 w-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-pankh-clay block">
                    {isCheckedInToday
                      ? d.sentinelCard.checkedToday
                      : d.sentinelCard.notCheckedToday}
                  </span>
                  {lastCheckinFormatted && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-600">
                      {isCheckedInToday ? `Today at ${lastCheckinFormatted}` : `Last: ${lastCheckinFormatted}`}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block">
                  {isCheckedInToday
                    ? `Mortality: ${todayLog?.mortality || 0} • Feed: ${todayLog?.feedKg ?? "—"} kg • Water: ${todayLog?.waterLitres !== null ? `${todayLog?.waterLitres} L` : "Skipped"}`
                    : "Log mortality, feed intake, and symptoms in under 60 seconds"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-5 border-t border-stone-200">
          <Link
            href={isCheckedInToday ? "/dashboard/sentinel" : "/dashboard/sentinel/checkin"}
            className={cn(
              "inline-flex items-center justify-between w-full h-12 px-4 rounded-xl text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer",
              alertSeverity === "RED"
                ? "bg-red-600 hover:bg-red-700"
                : alertSeverity === "AMBER"
                ? "bg-amber-600 hover:bg-amber-700"
                : isCheckedInToday
                ? "bg-emerald-700 hover:bg-emerald-800"
                : "bg-pankh-clay hover:bg-stone-800"
            )}
          >
            <span>{isCheckedInToday ? "View Sentinel Report" : d.sentinelCard.cta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>


      {/* ======================================================== */}
      {/* 3. Expert & Vet Help (Phulkari Vermilion Accent)         */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-orange-300 bg-gradient-to-br from-orange-50/60 via-white to-stone-50/40 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-950 font-bold text-xs">
              <Stethoscope className="h-3.5 w-3.5 text-orange-700" />
              {d.connectCard.badge}
            </span>
            <span className="text-xs font-mono text-stone-500">Punjab Network</span>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
              {d.connectCard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {d.connectCard.subtitle}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/95 border border-orange-200/80 space-y-1.5">
            <span className="text-xs font-semibold text-pankh-clay block">
              {d.connectCard.vetsAvailable}
            </span>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              Direct access to GADVASU Ludhiana specialists, registered district poultry veterinarians, and diagnostic post-mortem labs.
            </p>
          </div>
        </div>

        <div className="pt-5 mt-5 border-t border-orange-200/60">
          <Link
            href="/dashboard/connect"
            className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-phulkari hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>{d.connectCard.cta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. Batch Economics (Night Indigo Ledger Accent)          */}
      {/* ======================================================== */}
      <div className="rounded-3xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50/60 p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 font-bold text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />
              {d.economicsCard.badge}
            </span>
            <div className="flex items-center gap-2">
              {economics.feedCostShare ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {economics.feedCostShare}% Feed
                </span>
              ) : null}
              <span className="text-xs font-mono text-stone-500">Flock Ledger</span>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
              {d.economicsCard.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
              {d.economicsCard.subtitle}
            </p>
          </div>

          {/* Financial Ledger Snapshot Card */}
          <div className="grid grid-cols-3 gap-2 p-4 rounded-2xl bg-white/95 border border-indigo-100 text-center">
            <div>
              <span className="text-[10px] text-stone-500 block font-sans uppercase font-bold">
                {d.economicsCard.spendLabel}
              </span>
              <span className="text-xs sm:text-sm font-bold text-pankh-clay font-mono">
                ₹{economics.totalSpend.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="border-x border-stone-200">
              <span className="text-[10px] text-stone-500 block font-sans uppercase font-bold">
                {d.economicsCard.revenueLabel}
              </span>
              <span className="text-xs sm:text-sm font-bold text-emerald-700 font-mono">
                ₹{economics.totalRevenue.toLocaleString("en-IN")}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-500 block font-sans uppercase font-bold">
                {d.economicsCard.marginLabel}
              </span>
              <span className={cn(
                "text-xs sm:text-sm font-bold font-mono",
                economics.netMargin >= 0 ? "text-emerald-700" : "text-amber-700"
              )}>
                {economics.netMargin >= 0 ? "+" : ""}₹{economics.netMargin.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {economics.estimatedCostPerBird ? (
            <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
              <span>
                Cost/surviving bird: <strong className="text-pankh-clay">₹{economics.estimatedCostPerBird}</strong>
              </span>
              {economics.isEstimated ? (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  Estimated
                </span>
              ) : (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Verified
                </span>
              )}
            </div>
          ) : economics.totalSpend === 0 ? (
            <p className="text-[11px] text-stone-500 italic text-center">
              {d.economicsCard.emptyState}
            </p>
          ) : null}
        </div>

        <div className="pt-5 mt-5 border-t border-indigo-100 flex items-center gap-2">
          <Link
            href="/dashboard/economics/add"
            className="inline-flex items-center justify-center h-12 px-4 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-950 font-bold text-xs sm:text-sm shadow-2xs transition-colors cursor-pointer shrink-0"
          >
            + Add Entry
          </Link>
          <Link
            href="/dashboard/economics"
            className="inline-flex items-center justify-between flex-1 h-12 px-4 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>{d.economicsCard.cta}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
