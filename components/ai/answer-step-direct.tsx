import React from "react";
import { Lightbulb } from "lucide-react";

interface AnswerStepDirectProps {
  label: string;
  answerText: string;
}

export function AnswerStepDirect({ label, answerText }: AnswerStepDirectProps) {
  return (
    <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
        <Lightbulb className="h-3.5 w-3.5 text-amber-600" />
        <span>{label}</span>
      </div>
      <p className="text-stone-900 text-sm sm:text-base font-medium leading-relaxed">
        {answerText}
      </p>
    </div>
  );
}
