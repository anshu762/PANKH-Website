"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";

interface QuickPromptPillsProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

export function QuickPromptPills({
  onSelectPrompt,
  disabled = false,
}: QuickPromptPillsProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  const quickPrompts = [
    {
      label: dict.quickPromptFeed,
      text: "Day 15 broiler starter feed intake and standard FCR chart",
    },
    {
      label: dict.quickPromptHeat,
      text: "May-June garmi me shed foggers aur roof sprinklers ka schedule",
    },
    {
      label: dict.quickPromptVaccine,
      text: "Gumboro (IBD) aur LaSota vaccination schedule and skim milk stabilizer",
    },
    {
      label: dict.quickPromptRedFlag,
      text: "Chicks ki gardan mudi hui hai, gasping kar rahe hain aur subah se 30 mar gaye",
    },
  ];

  return (
    <div className="pt-3">
      <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1.5">
        {dict.quickPromptsLabel}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(qp.text)}
            disabled={disabled}
            className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-stone-50 hover:bg-amber-50/80 border border-stone-200 hover:border-amber-300 text-stone-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {qp.label}
          </button>
        ))}
      </div>
    </div>
  );
}
