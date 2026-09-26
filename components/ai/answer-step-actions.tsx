import React from "react";
import { ShieldCheck } from "lucide-react";

interface AnswerStepActionsProps {
  label: string;
  steps: string[];
}

export function AnswerStepActions({ label, steps }: AnswerStepActionsProps) {
  if (!steps || steps.length === 0) return null;

  return (
    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-900">
        <ShieldCheck className="h-4 w-4 text-emerald-700" />
        <span>{label}</span>
      </div>
      <ul className="space-y-2 text-xs sm:text-sm text-stone-800">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <div className="h-4 w-4 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              {idx + 1}
            </div>
            <span className="leading-snug font-medium">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
