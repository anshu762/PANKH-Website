"use client";

import React from "react";
import { AlertSeverityLevel } from "@/types/sentinel";
import { useLanguage } from "@/hooks/use-language";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentinelStatusBadgeProps {
  severity: AlertSeverityLevel;
  reasons: string[];
  lastCheckinTime?: string | null;
  ageBand?: string;
  ageInDays?: number;
  confidence?: string;
}

export function SentinelStatusBadge({
  severity,
  reasons,
  lastCheckinTime,
  ageBand,
  ageInDays,
  confidence,
}: SentinelStatusBadgeProps) {
  const { t } = useLanguage();
  const s = t.sentinel;

  const isRed = severity === "RED";
  const isAmber = severity === "AMBER";
  const isGreen = severity === "GREEN";

  const statusTitle = isRed
    ? s.statusUrgentTitle
    : isAmber
    ? s.statusWatchTitle
    : s.statusNormalTitle;

  const statusDesc = isRed
    ? s.statusUrgentDesc
    : isAmber
    ? s.statusWatchDesc
    : s.statusNormalDesc;

  return (
    <div
      className={cn(
        "rounded-3xl border-3 p-6 sm:p-8 transition-all relative overflow-hidden shadow-xs",
        isRed
          ? "border-red-500 bg-gradient-to-br from-red-500/15 via-white to-red-500/5 ring-4 ring-red-500/10"
          : isAmber
          ? "border-amber-500 bg-gradient-to-br from-amber-500/15 via-white to-amber-500/5 ring-4 ring-amber-500/10"
          : "border-emerald-500 bg-gradient-to-br from-emerald-500/15 via-white to-emerald-500/5 ring-4 ring-emerald-500/10"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border",
              isRed
                ? "bg-red-600 text-white border-red-700 animate-pulse"
                : isAmber
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-emerald-600 text-white border-emerald-700"
            )}
          >
            {isRed ? (
              <AlertOctagon className="h-8 w-8 sm:h-10 sm:w-10" />
            ) : isAmber ? (
              <AlertTriangle className="h-8 w-8 sm:h-10 sm:w-10" />
            ) : (
              <ShieldCheck className="h-8 w-8 sm:h-10 sm:w-10" />
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider",
                  isRed
                    ? "bg-red-200 text-red-950 border border-red-300"
                    : isAmber
                    ? "bg-amber-200 text-amber-950 border border-amber-300"
                    : "bg-emerald-200 text-emerald-950 border border-emerald-300"
                )}
              >
                {isRed ? "URGENT RED" : isAmber ? "WATCH AMBER" : "NORMAL GREEN"}
              </span>

              {ageBand && (
                <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold border border-stone-200">
                  {ageBand}
                </span>
              )}

              {confidence && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                  Baseline: {confidence}
                </span>
              )}
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
              {statusTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              {statusDesc}
            </p>
          </div>
        </div>

        {lastCheckinTime && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-stone-200 text-xs font-mono font-semibold text-stone-600 shrink-0 self-start md:self-center">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>Last checked: {lastCheckinTime}</span>
          </div>
        )}
      </div>

      {/* Primary reasons summary bullets */}
      {reasons && reasons.length > 0 && (
        <div className="mt-6 pt-5 border-t border-stone-200/80 space-y-2">
          <span className="text-xs uppercase font-bold tracking-wider text-stone-500 font-mono block">
            Surveillance Signal Diagnostics:
          </span>
          <ul className="space-y-1.5">
            {reasons.map((reason, idx) => (
              <li
                key={idx}
                className={cn(
                  "text-xs sm:text-sm font-semibold flex items-start gap-2",
                  isRed
                    ? "text-red-900"
                    : isAmber
                    ? "text-amber-950"
                    : "text-emerald-950"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full mt-1.5 shrink-0",
                    isRed
                      ? "bg-red-600"
                      : isAmber
                      ? "bg-amber-600"
                      : "bg-emerald-600"
                  )}
                />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
