"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Activity, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardRecentActivityProps {
  recentAlerts?: any[];
  recentLogs?: any[];
}

export function DashboardRecentActivity({
  recentAlerts = [],
  recentLogs = [],
}: DashboardRecentActivityProps) {
  const hasAlerts = recentAlerts.length > 0;
  const hasLogs = recentLogs.length > 0;

  if (!hasAlerts && !hasLogs) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 pt-2">
      {/* 1. Sentinel Surveillance Alerts */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-rose-500/15 text-rose-700 flex items-center justify-center">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-pankh-clay">
              Sentinel Surveillance Alerts
            </h3>
          </div>
          <Link
            href="/dashboard/sentinel"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>All Alerts</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {hasAlerts ? (
          <div className="space-y-2.5">
            {recentAlerts.map((alert) => {
              const isRed = alert.severity === "RED";
              const isAmber = alert.severity === "AMBER";

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3.5 rounded-2xl border text-xs flex items-start gap-3 transition-colors",
                    isRed
                      ? "bg-rose-50/70 border-rose-200 text-rose-950"
                      : isAmber
                      ? "bg-amber-50/70 border-amber-200 text-amber-950"
                      : "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                  )}
                >
                  <div
                    className={cn(
                      "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 font-bold text-[10px]",
                      isRed
                        ? "bg-rose-200 text-rose-800"
                        : isAmber
                        ? "bg-amber-200 text-amber-800"
                        : "bg-emerald-200 text-emerald-800"
                    )}
                  >
                    {alert.severity}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-semibold leading-relaxed line-clamp-2">
                      {alert.reason || "Flock pattern analyzed"}
                    </p>
                    <span className="text-[10px] opacity-70 block font-mono">
                      {new Date(alert.createdAt).toLocaleString("en-IN", {
                        timeZone: "Asia/Kolkata",
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-500 rounded-2xl bg-stone-50 border border-stone-200/60">
            No active alerts detected. Flock indicators normal.
          </div>
        )}
      </div>

      {/* 2. Daily Health Check-in Logs */}
      <div className="bg-white rounded-3xl border border-stone-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-700 flex items-center justify-center">
              <Activity className="h-4 w-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-pankh-clay">
              Recent Daily Health Entries
            </h3>
          </div>
          <Link
            href="/dashboard/sentinel"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>Full History</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {hasLogs ? (
          <div className="space-y-2.5">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-pankh-clay block">
                      Mortality: {log.mortality} birds
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Feed: {log.feedKg} kg • Water: {log.waterLiters} L
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-stone-500 shrink-0">
                  {new Date(log.createdAt).toLocaleDateString("en-IN", {
                    timeZone: "Asia/Kolkata",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-stone-500 rounded-2xl bg-stone-50 border border-stone-200/60">
            No health logs recorded yet for this batch.
          </div>
        )}
      </div>
    </div>
  );
}
