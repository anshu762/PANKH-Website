"use client";

import React from "react";
import { MessageSquare, Mic, Camera } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  activeTab: "TEXT" | "VOICE" | "PHOTO";
  onTabChange: (tab: "TEXT" | "VOICE" | "PHOTO") => void;
  birdType?: string | null;
}

export function ChatHeader({
  activeTab,
  onTabChange,
  birdType,
}: ChatHeaderProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700 font-serif font-bold text-lg shadow-xs">
          ਪੰ
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
              {dict.pageTitle}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              RAG Active
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-tight">
            {birdType ? `${birdType} Flock` : "Commercial Poultry"} • Punjab Extension Protocols
          </p>
        </div>
      </div>

      {/* 3 Input Mode Switcher Tabs */}
      <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
        <button
          type="button"
          onClick={() => onTabChange("TEXT")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px]",
            activeTab === "TEXT"
              ? "bg-white text-pankh-clay shadow-xs font-bold"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{dict.tabText}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("VOICE")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px]",
            activeTab === "VOICE"
              ? "bg-white text-pankh-clay shadow-xs font-bold"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          <Mic className="h-3.5 w-3.5 text-amber-700" />
          <span>{dict.tabVoice}</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("PHOTO")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[38px]",
            activeTab === "PHOTO"
              ? "bg-white text-pankh-clay shadow-xs font-bold"
              : "text-stone-600 hover:text-stone-900"
          )}
        >
          <Camera className="h-3.5 w-3.5 text-blue-600" />
          <span>{dict.tabPhoto}</span>
        </button>
      </div>
    </div>
  );
}
