"use client";

import React from "react";
import Link from "next/link";
import { Warehouse, Calendar, Activity, AlertTriangle, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface DashboardHeroBannerProps {
  farmer: any;
  farm: any;
  batch: any;
  flockCycle: {
    day: number;
    targetDays: number;
    livability: number;
    progressPercent: number;
  } | null;
}

export function DashboardHeroBanner({
  farmer,
  farm,
  batch,
  flockCycle,
}: DashboardHeroBannerProps) {
  const { t } = useLanguage();
  const d = t.dashboardHome;

  const farmerName = farmer?.user?.name || "Farmer";
  const village = farmer?.village || "Punjab";
  const district = farmer?.district || "Ludhiana";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FAF9F5] to-amber-50/40 border border-stone-200/90 p-6 sm:p-8 shadow-xs">
      {/* Decorative Phulkari Geometric Accent in Top-Right Corner */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Column: Editorial Greeting & Agrarian Context */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-950 font-mono text-[11px] font-bold tracking-tight">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
              {farm?.name || "Pankh Commercial Farm"}
            </span>
            <span className="text-xs text-stone-500 font-sans">
              {village}, {district}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-pankh-clay tracking-tight leading-[1.15]">
            {d.greeting},{" "}
            <span className="font-serif italic font-semibold text-amber-900">
              {farmerName}
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
            Punjab Extension Protocols Active • Real-time flock health surveillance and advisory
          </p>
        </div>

        {/* Right Column: Active Batch Cycle & Livability Gauge */}
        {batch && flockCycle ? (
          <div className="bg-white/95 backdrop-blur-xs rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs shrink-0 min-w-[280px] sm:min-w-[320px] space-y-3">
            <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800">
                  <Warehouse className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-pankh-clay block leading-tight">
                    {batch.breed} {batch.productionType === "BROILER" ? "Broiler" : "Layer"}
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono">
                    Shed 1 • Cap {farm?.capacity?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Livability
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700 font-mono">
                  {flockCycle.livability}%
                </span>
              </div>
            </div>

            {/* Flock Cycle Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-pankh-clay flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-amber-700" />
                  <span>Day {flockCycle.day}</span>
                  <span className="text-stone-400 font-normal">of {flockCycle.targetDays}</span>
                </span>
                <span className="text-[11px] font-mono font-semibold text-stone-600">
                  {flockCycle.progressPercent}% of cycle
                </span>
              </div>

              <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden p-0.5 border border-stone-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(5, flockCycle.progressPercent))}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-0.5">
                <span>Current: <strong>{batch.currentBirds?.toLocaleString()}</strong> birds</span>
                <span>Target Harvest: Day {flockCycle.targetDays}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-5 text-xs text-amber-950 flex items-center gap-4 shrink-0 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <span className="font-bold block text-sm">No Active Batch Placed</span>
              <p className="text-xs text-stone-600">
                Set up a new chick placement to track flock health and economics.
              </p>
              <Link
                href="/onboarding/farm"
                className="inline-block pt-1 underline font-bold text-primary text-xs"
              >
                + Register New Batch
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
