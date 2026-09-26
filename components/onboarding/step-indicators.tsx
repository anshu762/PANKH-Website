"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface StepIndicatorsProps {
  step: 1 | 2;
  onStepClick?: (step: 1 | 2) => void;
}

export function StepIndicators({ step, onStepClick }: StepIndicatorsProps) {
  const { t } = useLanguage();
  const o = t.onboarding;

  return (
    <div className="mb-8 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-stone-600">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 font-bold border border-amber-300/80">
          <Sparkles className="h-3.5 w-3.5 text-amber-700" />
          {o.badge}
        </span>
        <span className="text-stone-500 font-mono font-bold">
          Step {step} of 2
        </span>
      </div>

      {/* Segmented Step Bar */}
      <div className="grid grid-cols-2 gap-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            step >= 1 ? "bg-pankh-marigold" : "bg-stone-200"
          }`}
        />
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            step === 2 ? "bg-pankh-marigold" : "bg-stone-200"
          }`}
        />
      </div>

      <div className="pt-2">
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-pankh-clay tracking-tight">
          {step === 1 ? o.step1Title : o.step2Title}
        </h1>
        <p className="text-stone-600 text-xs sm:text-sm mt-1 leading-relaxed">
          {step === 1 ? o.step1Desc : o.step2Desc}
        </p>
      </div>
    </div>
  );
}
