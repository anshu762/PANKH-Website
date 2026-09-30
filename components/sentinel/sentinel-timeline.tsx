"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import {
  Calendar,
  Activity,
  Droplets,
  Wheat,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentinelTimelineProps {
  logs: any[];
  alerts?: any[];
}

export function SentinelTimeline({ logs, alerts = [] }: SentinelTimelineProps) {
  const { t } = useLanguage();
  const s = t.sentinel;

  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 rounded-3xl border-2 border-dashed border-stone-200 text-center bg-white space-y-3">
        <Clock className="h-8 w-8 text-stone-300 mx-auto" />
        <h4 className="font-serif text-base font-bold text-pankh-clay">
          {s.historyTitle}
        </h4>
        <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
          {s.historyEmpty}
        </p>
        <div className="pt-2">
          <Link
            href="/dashboard/sentinel/checkin"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pankh-clay hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors"
          >
            <span>{s.logTodayCta || "Log Today's First Check-in"}</span>
          </Link>
        </div>
      </div>
    );
  }

  // Create lookup of alerts by approximate date
  const alertsByDate = new Map<string, any>();
  for (const alert of alerts) {
    const alertDate = new Date(alert.createdAt).toISOString().split("T")[0];
    if (!alertsByDate.has(alertDate)) {
      alertsByDate.set(alertDate, alert);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
          {s.historyTitle}
        </h3>
        <span className="text-xs font-mono text-stone-400">
          Last {logs.length} check-ins
        </span>
      </div>

      <div className="space-y-3">
        {logs.map((log) => {
          const logDateObj = new Date(log.date || log.createdAt);
          const dateStr = logDateObj.toISOString().split("T")[0];
          const matchedAlert = alertsByDate.get(dateStr);

          const formattedDate = logDateObj.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          });

          const formattedTime = logDateObj.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Asia/Kolkata",
          });

          const severity = matchedAlert?.severity || (log.mortality >= 10 ? "RED" : log.mortality >= 4 ? "AMBER" : "GREEN");
          const isRed = severity === "RED";
          const isAmber = severity === "AMBER";

          return (
            <div
              key={log.id}
              className={cn(
                "p-4 sm:p-5 rounded-2xl border-2 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:shadow-2xs",
                isRed
                  ? "border-red-300"
                  : isAmber
                  ? "border-amber-300"
                  : "border-stone-200"
              )}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={cn(
                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                    isRed
                      ? "bg-red-100 border-red-200 text-red-700"
                      : isAmber
                      ? "bg-amber-100 border-amber-200 text-amber-700"
                      : "bg-emerald-100 border-emerald-200 text-emerald-700"
                  )}
                >
                  {isRed ? (
                    <AlertOctagon className="h-5 w-5" />
                  ) : isAmber ? (
                    <AlertTriangle className="h-5 w-5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-pankh-clay">
                      {formattedDate}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      {formattedTime}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase",
                        isRed
                          ? "bg-red-100 text-red-900 border border-red-200"
                          : isAmber
                          ? "bg-amber-100 text-amber-900 border border-amber-200"
                          : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                      )}
                    >
                      {severity}
                    </span>
                  </div>

                  {matchedAlert?.reason && (
                    <p className="text-xs text-stone-600 line-clamp-1">
                      {matchedAlert.reason}
                    </p>
                  )}

                  {/* Symptoms chips */}
                  {log.symptoms && log.symptoms.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {log.symptoms.map((sym: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200"
                        >
                          {sym}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Metric stats snapshot */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-4 shrink-0 text-left border-t md:border-t-0 pt-2 md:pt-0">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
                    Mortality
                  </span>
                  <span
                    className={cn(
                      "text-xs sm:text-sm font-mono font-bold block",
                      log.mortality > 5 ? "text-red-700" : "text-pankh-clay"
                    )}
                  >
                    {log.mortality} birds
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
                    Feed
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-pankh-clay block">
                    {log.feedKg !== null ? `${log.feedKg} kg` : "—"}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
                    Water
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-pankh-clay block">
                    {log.waterLitres !== null ? `${log.waterLitres} L` : "Skipped"}
                  </span>
                </div>

                {log.shedTemp !== null && (
                  <div className="hidden sm:block">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
                      Shed Temp
                    </span>
                    <span className="text-xs sm:text-sm font-mono font-bold text-pankh-clay block">
                      {log.shedTemp}°C
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
