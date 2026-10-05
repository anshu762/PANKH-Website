"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { Wheat, SunMedium, Syringe, AlertTriangle } from "lucide-react";

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
      icon: Wheat,
      label: dict.quickPromptFeed || "15-Day Feed & FCR",
      text: "Day 15 broiler starter feed intake, crude protein percentage and standard FCR chart",
      color: "hover:border-amber-400 hover:bg-amber-50 text-amber-900",
    },
    {
      icon: SunMedium,
      label: dict.quickPromptHeat || "Heat Stress & Foggers",
      text: "May-June garmi me shed foggers aur roof sprinklers ka schedule aur electrolytes",
      color: "hover:border-orange-400 hover:bg-orange-50 text-orange-900",
    },
    {
      icon: Syringe,
      label: dict.quickPromptVaccine || "IBD & LaSota Vaccine",
      text: "Gumboro (IBD) aur LaSota vaccination schedule and skim milk stabilizer",
      color: "hover:border-blue-400 hover:bg-blue-50 text-blue-900",
    },
    {
      icon: AlertTriangle,
      label: dict.quickPromptRedFlag || "🚨 Red Flag Emergency",
      text: "Chicks ki gardan mudi hui hai, gasping kar rahe hain aur subah se 30 mar gaye",
      color: "hover:border-rose-400 hover:bg-rose-50 text-rose-900",
    },
  ];

  return (
    <div className="pt-2 relative">
      <div
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth"
      >
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 select-none font-mono">
          Quick test:
        </span>
        {quickPrompts.map((qp, idx) => {
          const Icon = qp.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(qp.text)}
              disabled={disabled}
              className={`shrink-0 text-left text-xs px-2.5 py-1.5 rounded-xl bg-white border border-stone-200 shadow-2xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${qp.color}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" />
              <span className="whitespace-nowrap">{qp.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
