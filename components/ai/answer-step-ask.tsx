import React from "react";
import { HelpCircle } from "lucide-react";

interface AnswerStepAskProps {
  label: string;
  questions?: string[];
  onSelectQuestion?: (q: string) => void;
}

export function AnswerStepAsk({ label, questions, onSelectQuestion }: AnswerStepAskProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-600">
        <HelpCircle className="h-3.5 w-3.5 text-stone-500" />
        <span>{label}</span>
      </div>
      <div className="space-y-1.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion && onSelectQuestion(q)}
            className="w-full text-left text-xs sm:text-sm text-stone-700 hover:text-stone-950 p-2 rounded-lg bg-white border border-stone-200 hover:border-amber-400 transition-colors flex items-center justify-between group min-h-[38px]"
          >
            <span className="italic">“{q}”</span>
            <span className="text-[11px] font-bold text-amber-700 opacity-0 group-hover:opacity-100 transition-opacity">
              Ask this →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
