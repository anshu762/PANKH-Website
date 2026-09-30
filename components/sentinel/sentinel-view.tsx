"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { SentinelDashboardData } from "@/types/sentinel";
import { SentinelStatusBadge } from "./sentinel-status-badge";
import { SentinelComparisonCards } from "./sentinel-comparison-cards";
import { SentinelRecommendations } from "./sentinel-recommendations";
import { SentinelFarmerActions } from "./sentinel-farmer-actions";
import { SentinelTimeline } from "./sentinel-timeline";
import {
  ShieldAlert,
  PlusCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentinelViewProps {
  data: SentinelDashboardData;
}

export function SentinelView({ data }: SentinelViewProps) {
  const { t, lang } = useLanguage();
  const s = t.sentinel;

  const {
    farmer,
    farm,
    batch,
    todayLog,
    latestAlert,
    recentLogs,
    recentAlerts,
    baseline,
    latestRisk,
    lastCheckinTime,
    isCheckedInToday,
  } = data;

  const severity = latestAlert?.severity || latestRisk?.severity || "GREEN";
  const reasons = latestAlert?.reason
    ? latestAlert.reason.split("; ")
    : latestRisk?.reasons || [];
  const recommendations = latestRisk?.recommendations || [
    "Maintain standard biosecurity foot-dip disinfection at shed entrances.",
    "Continue regular water sanitation (chlorination/acidification) and record evening check-in.",
    "Ensure litter remains dry and friable; rake damp spots under waterers.",
  ];

  const signals = (latestAlert?.signalsTriggered as any) || latestRisk?.signalsTriggered || {};
  const currentAction = signals.farmerAction || null;

  return (
    <div key={lang} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Module Header & Check-in Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl border-2 border-stone-200 p-6 sm:p-7 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300">
              Pankh Sentinel Radar
            </span>
            <span className="text-xs font-mono text-stone-400">
              {farm.name} • Shed 1
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
            {s.alertScreenTitle}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 max-w-xl">
            {s.alertScreenSubtitle}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-3">
          {isCheckedInToday ? (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold font-mono">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>{s.alreadyLoggedToday}</span>
            </div>
          ) : (
            <Link
              href="/dashboard/sentinel/checkin"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-pankh-marigold hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              <span>{s.logTodayCta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 2. Large NORMAL/WATCH/URGENT Status Badge */}
      <SentinelStatusBadge
        severity={severity as any}
        reasons={reasons}
        lastCheckinTime={lastCheckinTime}
        ageBand={signals.ageBand}
        ageInDays={signals.ageInDays}
        confidence={baseline.confidence}
      />

      {/* 3. Explicit "What changed compared to what" Section */}
      <SentinelComparisonCards
        todayLog={todayLog}
        baseline={baseline}
        productionType={batch.productionType}
      />

      {/* 4. Immediate Action Protocol & Emergency Vet CTA */}
      <SentinelRecommendations
        severity={severity as any}
        recommendations={recommendations}
        alertId={latestAlert?.id}
        caseId={latestAlert?.caseRecords?.[0]?.id}
      />

      {/* 5. Three Farmer Actions (Resolved / Still Happening / Vet Contacted) */}
      <SentinelFarmerActions
        alertId={latestAlert?.id}
        initialAction={currentAction}
        acknowledged={latestAlert?.acknowledged}
      />

      {/* 6. Past Check-ins / Alerts Timeline */}
      <SentinelTimeline logs={recentLogs} alerts={recentAlerts} />
    </div>
  );
}
