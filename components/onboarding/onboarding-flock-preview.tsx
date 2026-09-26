"use client";

import React from "react";
import { Sparkles, Droplets, Wheat, Calendar } from "lucide-react";

interface OnboardingFlockPreviewProps {
  birdCount: number;
  productionType: string;
  breed: string;
  placementDate: string;
}

export function OnboardingFlockPreview({
  birdCount = 3000,
  productionType = "BROILER",
  breed = "Cobb 500",
  placementDate,
}: OnboardingFlockPreviewProps) {
  const birds = Math.max(100, Number(birdCount) || 3000);
  const isBroiler = productionType === "BROILER";

  // Agrarian standards (ICAR / CPDO):
  // Starter broiler daily intake at day 10 avg: ~45g/bird = (birds * 0.045) kg
  const estimatedFeedPerDay = Math.round(birds * 0.048);
  // Water intake is ~2x feed intake
  const estimatedWaterPerDay = Math.round(estimatedFeedPerDay * 2.1);
  const targetDays = isBroiler ? 42 : 504;

  return (
    <div className="rounded-3xl border border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-5 sm:p-6 shadow-xs space-y-3.5">
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/20 text-amber-800 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="font-serif font-bold text-xs sm:text-sm text-pankh-clay">
            Flock Projections (Punjab Agrarian Benchmark)
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
          {breed}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-center gap-1 text-stone-500">
            <Wheat className="h-3.5 w-3.5 text-amber-700" />
            <span className="text-[10px] uppercase font-bold font-mono">Starter Feed</span>
          </div>
          <span className="font-serif font-bold text-sm sm:text-base text-pankh-clay block">
            ~{estimatedFeedPerDay} kg/day
          </span>
          <span className="text-[9px] text-stone-400 block">estimated</span>
        </div>

        <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-center gap-1 text-stone-500">
            <Droplets className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-[10px] uppercase font-bold font-mono">Clean Water</span>
          </div>
          <span className="font-serif font-bold text-sm sm:text-base text-pankh-clay block">
            ~{estimatedWaterPerDay} L/day
          </span>
          <span className="text-[9px] text-stone-400 block">pH 6.2 - 6.8</span>
        </div>

        <div className="p-3 rounded-2xl bg-white/90 border border-amber-200/80 space-y-1">
          <div className="flex items-center justify-center gap-1 text-stone-500">
            <Calendar className="h-3.5 w-3.5 text-emerald-700" />
            <span className="text-[10px] uppercase font-bold font-mono">Harvest</span>
          </div>
          <span className="font-serif font-bold text-sm sm:text-base text-pankh-clay block">
            {isBroiler ? "Day 42" : "72 Weeks"}
          </span>
          <span className="text-[9px] text-stone-400 block">~2.2 - 2.5 kg avg</span>
        </div>
      </div>
    </div>
  );
}
