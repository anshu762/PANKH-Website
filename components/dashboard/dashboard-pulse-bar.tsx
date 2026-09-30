"use client";

import React from "react";
import Link from "next/link";
import { Sun, CloudSun, AlertCircle, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface DashboardPulseBarProps {
  weather?: {
    temp: number;
    condition: string;
    humidity: number;
    heatRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    recommendation: string;
  };
  todayLog?: any;
  latestAlert?: any;
  recentLogs?: any[];
}

export function DashboardPulseBar({
  weather,
  todayLog,
  latestAlert,
  recentLogs = [],
}: DashboardPulseBarProps) {
  const { t } = useLanguage();
  const d = t.dashboardHome;

  const isCheckedIn = Boolean(todayLog);
  const severity = latestAlert?.severity || "GREEN";

  const lastLog = todayLog || (recentLogs && recentLogs[0]) || null;
  const lastCheckinFormatted = lastLog
    ? new Date(lastLog.date || lastLog.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-stretch">
      {/* 1. Live Weather & Shed Heat-Stress Bar (7 cols) */}
      <div className="md:col-span-7 bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 shrink-0">
            <Sun className="h-5 w-5 animate-[spin_12s_linear_infinite]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-base text-pankh-clay">
                {weather?.temp || 34}°C
              </span>
              <span className="text-xs text-stone-600 font-medium">
                {weather?.condition || "Sunny • Punjab"}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold">
                {weather?.heatRisk === "MODERATE" ? "Moderate Heat" : "Normal"}
              </span>
            </div>
            <p className="text-xs text-stone-500 leading-tight mt-0.5">
              {weather?.recommendation || "Ensure fresh drinking water and monitor shed airflow"}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 sm:border-l border-stone-100 pt-2 sm:pt-0 sm:pl-3">
          <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
            Humidity
          </span>
          <span className="text-xs sm:text-sm font-bold text-stone-700 font-mono">
            {weather?.humidity || 46}%
          </span>
        </div>
      </div>

      {/* 2. Today's Sentinel Check-in Status (5 cols) */}
      <div
        className={cn(
          "md:col-span-5 rounded-2xl border p-4 sm:p-4.5 shadow-xs flex items-center justify-between gap-3 transition-colors",
          severity === "RED"
            ? "bg-red-50/80 border-red-300 text-red-950"
            : severity === "AMBER"
            ? "bg-amber-50/80 border-amber-300 text-amber-950"
            : isCheckedIn
            ? "bg-emerald-50/70 border-emerald-300/80 text-emerald-950"
            : "bg-amber-50/80 border-amber-300/80 text-amber-950"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
              severity === "RED"
                ? "bg-red-100 border-red-300 text-red-800"
                : severity === "AMBER"
                ? "bg-amber-100 border-amber-300 text-amber-800"
                : isCheckedIn
                ? "bg-emerald-100/80 border-emerald-300 text-emerald-800"
                : "bg-amber-100/90 border-amber-300 text-amber-800"
            )}
          >
            {severity === "RED" ? (
              <AlertCircle className="h-5 w-5 text-red-700 animate-pulse" />
            ) : isCheckedIn ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
            ) : (
              <Clock className="h-5 w-5 text-amber-700 animate-pulse" />
            )}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-bold block truncate">
              {isCheckedIn
                ? d.sentinelCard.checkedToday
                : d.sentinelCard.notCheckedToday}
            </span>
            <span className="text-[11px] opacity-80 block truncate">
              {isCheckedIn
                ? `Mortality: ${todayLog?.mortality || 0} • Feed: ${todayLog?.feedKg ?? "—"} kg • ${lastCheckinFormatted || ""}`
                : "Log feed, water, and mortality in under 60s"}
            </span>
          </div>
        </div>

        <Link
          href={isCheckedIn ? "/dashboard/sentinel" : "/dashboard/sentinel/checkin"}
          className={cn(
            "px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs shrink-0 flex items-center gap-1 transition-all",
            severity === "RED"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : severity === "AMBER"
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : isCheckedIn
              ? "bg-emerald-700 hover:bg-emerald-800 text-white"
              : "bg-pankh-marigold hover:bg-amber-600 text-white"
          )}
        >
          <span>{isCheckedIn ? "View" : "Log Now"}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

