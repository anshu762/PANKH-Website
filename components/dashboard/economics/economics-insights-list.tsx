"use client";

import React from "react";
import {
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  Scale,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { EconomicsInsight, BatchEconomicsReport } from "@/types/economics";
import { getDeterministicLocalizedInsightBody } from "@/lib/economics/insights";
import { cn } from "@/lib/utils";

interface EconomicsInsightsListProps {
  insights: EconomicsInsight[];
  report: BatchEconomicsReport;
}

export function EconomicsInsightsList({
  insights,
  report,
}: EconomicsInsightsListProps) {
  const { lang, t } = useLanguage();
  const d = t.economics;

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
              Flock Intelligence & Economic Insights
            </h3>
            <p className="text-[11px] text-stone-500">
              Rule-based deterministic analysis comparing feed, mortality, and cost benchmarks.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {insights.map((insight) => {
          const bodyText = getDeterministicLocalizedInsightBody(insight, lang as any);

          return (
            <div
              key={insight.id}
              className={cn(
                "p-4 rounded-2xl border transition-all space-y-2",
                insight.severity === "urgent"
                  ? "bg-red-50/60 border-red-200"
                  : insight.severity === "warning"
                  ? "bg-amber-50/50 border-amber-200"
                  : insight.severity === "positive"
                  ? "bg-emerald-50/50 border-emerald-200"
                  : "bg-indigo-50/40 border-indigo-100"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {insight.severity === "urgent" ? (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                  ) : insight.severity === "warning" ? (
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  ) : insight.severity === "positive" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Info className="h-4 w-4 text-indigo-600 shrink-0" />
                  )}
                  <span className="text-xs sm:text-sm font-bold text-pankh-clay">
                    {insight.headline}
                  </span>
                </div>

                {insight.isEstimated ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/90 text-amber-900 border border-amber-300 font-bold shrink-0">
                    {insight.assumptionLabel || d.estimatedBadge}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-900 border border-emerald-300 font-bold shrink-0">
                    {d.verifiedBadge}
                  </span>
                )}
              </div>

              <p className="text-xs text-stone-700 leading-relaxed pl-6">
                {bodyText}
              </p>
            </div>
          );
        })}

        {/* Feed Conversion Ratio (FCR) Strict Verification Notice */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-2.5">
          <Scale className="h-4 w-4 text-stone-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-700">
                Feed Conversion Ratio (FCR):
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                {report.feedConversionRatio.value !== null
                  ? report.feedConversionRatio.value
                  : "Not Available (Unfabricated)"}
              </span>
            </div>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {report.feedConversionRatio.value !== null
                ? `Calculated FCR: ${report.feedConversionRatio.value} kg feed per kg bird live weight.`
                : "FCR is strictly never fabricated without actual flock weigh-in data. To compute FCR, record average bird weigh-in before lift."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
