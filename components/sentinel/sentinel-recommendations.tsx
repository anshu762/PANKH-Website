"use client";

import React from "react";
import Link from "next/link";
import { AlertSeverityLevel } from "@/types/sentinel";
import { useLanguage } from "@/hooks/use-language";
import {
  Stethoscope,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SentinelRecommendationsProps {
  severity: AlertSeverityLevel;
  recommendations: string[];
  alertId?: string;
  caseId?: string;
}

export function SentinelRecommendations({
  severity,
  recommendations,
  alertId,
  caseId,
}: SentinelRecommendationsProps) {
  const { t } = useLanguage();
  const s = t.sentinel;

  const isRed = severity === "RED";
  const isAmber = severity === "AMBER";

  return (
    <div
      className={cn(
        "p-6 sm:p-7 rounded-3xl border-2 bg-white space-y-5 shadow-xs",
        isRed
          ? "border-red-300"
          : isAmber
          ? "border-amber-300"
          : "border-stone-200"
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center shrink-0",
              isRed
                ? "bg-red-100 text-red-700"
                : isAmber
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
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
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
              {s.recommendationsTitle}
            </h3>
            <span className="text-xs text-stone-500">
              {isRed
                ? "Emergency Veterinary Containment Steps"
                : isAmber
                ? "Preventative Shed Intervention Steps"
                : "Standard Good Husbandry Routine"}
            </span>
          </div>
        </div>

        {/* Contact a Vet CTA Button (VISIBLE ONLY WHEN SEVERITY IS RED) */}
        {isRed && (
          <Link
            href={`/dashboard/connect?alertId=${alertId || ""}&caseId=${caseId || ""}&escalate=true`}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-pankh-phulkari hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all shrink-0 cursor-pointer animate-pulse"
          >
            <Stethoscope className="h-4 w-4" />
            <span>{s.contactVetButton}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="space-y-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 text-xs sm:text-sm text-stone-700 font-medium leading-relaxed"
          >
            <span className="h-5 w-5 rounded-full bg-white border border-stone-300 flex items-center justify-center text-[10px] font-bold text-pankh-clay shrink-0 mt-0.5 font-mono shadow-2xs">
              {idx + 1}
            </span>
            <span>{rec}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
