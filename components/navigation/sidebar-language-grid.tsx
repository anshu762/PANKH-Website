"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { SupportedLanguage } from "@/lib/i18n/types";
import { cn } from "@/lib/utils";

const SIDEBAR_LANG_OPTIONS: { code: SupportedLanguage; label: string; tooltip: string }[] = [
  { code: "pa", label: "ਪੰਜਾਬੀ", tooltip: "ਪੰਜਾਬੀ (Gurmukhi)" },
  { code: "en", label: "EN", tooltip: "English" },
  { code: "hi", label: "हिन्दी", tooltip: "हिन्दी (Hindi)" },
];

export function SidebarLanguageGrid() {
  const { lang, setLanguage } = useLanguage();

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono block">
        Language / ਭਾਸ਼ਾ
      </span>
      <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-stone-100/90 border border-stone-200/80">
        {SIDEBAR_LANG_OPTIONS.map((opt) => {
          const isActive = lang === opt.code;

          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              title={opt.tooltip}
              className={cn(
                "py-1.5 px-1 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer truncate",
                isActive
                  ? "bg-pankh-marigold text-white shadow-xs font-bold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-white/80"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
