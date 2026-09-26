import React from "react";
import { CheckCircle } from "lucide-react";

interface AnswerStepWhyProps {
  label: string;
  points: string[];
}

export function AnswerStepWhy({ label, points }: AnswerStepWhyProps) {
  if (!points || points.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">
        {label}
      </h4>
      <ul className="space-y-2 text-xs sm:text-sm text-stone-700">
        {points.map((point, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <CheckCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
