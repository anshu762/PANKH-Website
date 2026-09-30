"use client";

import React from "react";
import { BatchBaseline, SentinelCheckinInput } from "@/types/sentinel";
import { useLanguage } from "@/hooks/use-language";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Activity,
  Droplets,
  Wheat,
  Thermometer,
  Egg,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentinelComparisonCardsProps {
  todayLog?: any | null;
  baseline: BatchBaseline;
  productionType?: "BROILER" | "LAYER" | string;
}

export function SentinelComparisonCards({
  todayLog,
  baseline,
  productionType = "BROILER",
}: SentinelComparisonCardsProps) {
  const { t } = useLanguage();
  const s = t.sentinel;

  // Compute deviations
  const mortalityToday = todayLog?.mortality ?? 0;
  const mortalityBaseline = baseline.mortality?.median ?? 0;

  const feedToday = todayLog?.feedKg ?? null;
  const feedBaseline = baseline.feedKg?.median ?? null;

  const waterToday = todayLog?.waterLitres ?? null;
  const waterBaseline = baseline.waterLitres?.median ?? null;

  const eggToday = todayLog?.eggCount ?? null;
  const eggBaseline = baseline.eggCount?.median ?? null;

  const tempToday = todayLog?.shedTemp ?? null;
  const tempBaseline = baseline.shedTemp?.median ?? null;

  const getPercentageDiff = (today: number | null, base: number | null) => {
    if (today === null || base === null || base === 0) return null;
    return Number((((today - base) / base) * 100).toFixed(1));
  };

  const feedDiff = getPercentageDiff(feedToday, feedBaseline);
  const waterDiff = getPercentageDiff(waterToday, waterBaseline);
  const eggDiff = getPercentageDiff(eggToday, eggBaseline);

  const metrics = [
    {
      title: s.metricMortality,
      icon: Activity,
      today: `${mortalityToday} birds`,
      baseline: `${mortalityBaseline} birds / day`,
      diffText:
        mortalityToday > mortalityBaseline
          ? `+${mortalityToday - mortalityBaseline} above normal`
          : "Normal livability",
      isWarning: mortalityToday >= 5 || (mortalityBaseline > 0 && mortalityToday >= mortalityBaseline * 2),
      isSevere: mortalityToday >= 15,
    },
    {
      title: s.metricFeed,
      icon: Wheat,
      today: feedToday !== null ? `${feedToday} kg` : "Not recorded",
      baseline: feedBaseline !== null ? `${feedBaseline} kg` : "Pending baseline",
      diffText:
        feedDiff !== null
          ? feedDiff < 0
            ? `${Math.abs(feedDiff)}% drop`
            : `+${feedDiff}% normal`
          : "Baseline accumulating",
      isWarning: feedDiff !== null && feedDiff <= -15,
      isSevere: feedDiff !== null && feedDiff <= -25,
    },
    {
      title: s.metricWater,
      icon: Droplets,
      today: waterToday !== null ? `${waterToday} L` : "Not recorded (skipped)",
      baseline: waterBaseline !== null ? `${waterBaseline} L` : "Pending baseline",
      diffText:
        waterDiff !== null
          ? waterDiff < 0
            ? `${Math.abs(waterDiff)}% drop`
            : `+${waterDiff}% normal`
          : waterToday === null
          ? "No intake penalty"
          : "Baseline accumulating",
      isWarning: waterDiff !== null && waterDiff <= -15,
      isSevere: waterDiff !== null && waterDiff <= -25,
    },
    ...(productionType === "LAYER"
      ? [
          {
            title: s.metricEggs,
            icon: Egg,
            today: eggToday !== null ? `${eggToday} eggs` : "Not recorded",
            baseline: eggBaseline !== null ? `${eggBaseline} eggs` : "Pending baseline",
            diffText:
              eggDiff !== null
                ? eggDiff < 0
                  ? `${Math.abs(eggDiff)}% drop`
                  : `+${eggDiff}% normal`
                : "Baseline accumulating",
            isWarning: eggDiff !== null && eggDiff <= -10,
            isSevere: eggDiff !== null && eggDiff <= -20,
          },
        ]
      : []),
    {
      title: s.metricShedTemp,
      icon: Thermometer,
      today: tempToday !== null ? `${tempToday}°C` : "Not recorded",
      baseline: tempBaseline !== null ? `${tempBaseline}°C normal` : "30.0°C standard",
      diffText:
        tempToday !== null
          ? tempToday >= 38
            ? "Critical heat stress"
            : tempToday >= 34
            ? "High shed heat"
            : "Comfort range"
          : "Standard ventilation",
      isWarning: tempToday !== null && tempToday >= 34,
      isSevere: tempToday !== null && tempToday >= 38,
    },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
          {s.comparisonTitle}
        </h3>
        <p className="text-xs text-stone-500">{s.comparisonSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, idx) => {
          const IconComp = m.icon;

          return (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-2xl border-2 bg-white flex flex-col justify-between space-y-3 transition-all",
                m.isSevere
                  ? "border-red-400 bg-red-50/30"
                  : m.isWarning
                  ? "border-amber-400 bg-amber-50/30"
                  : "border-stone-200 hover:border-stone-300"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-600 block">
                  {m.title}
                </span>
                <IconComp
                  className={cn(
                    "h-4 w-4",
                    m.isSevere
                      ? "text-red-600"
                      : m.isWarning
                      ? "text-amber-600"
                      : "text-stone-400"
                  )}
                />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block font-mono">
                  {s.todayValue}
                </span>
                <span className="text-base sm:text-lg font-serif font-bold text-pankh-clay block font-mono">
                  {m.today}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px]">
                <div className="min-w-0">
                  <span className="text-[10px] text-stone-400 block">
                    {s.baselineValue}
                  </span>
                  <span className="font-mono text-stone-600 font-semibold truncate block">
                    {m.baseline}
                  </span>
                </div>

                <span
                  className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-md font-bold shrink-0 ml-1",
                    m.isSevere
                      ? "bg-red-100 text-red-900 border border-red-200"
                      : m.isWarning
                      ? "bg-amber-100 text-amber-900 border border-amber-200"
                      : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                  )}
                >
                  {m.diffText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
