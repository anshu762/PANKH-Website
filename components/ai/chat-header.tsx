"use client";

import React from "react";
import { Sparkles, RotateCcw, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface ChatHeaderProps {
  onClearChat?: () => void;
  hasMessages?: boolean;
  birdType?: string | null;
}

export function ChatHeader({
  onClearChat,
  hasMessages = false,
  birdType,
}: ChatHeaderProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  return (
    <div className="flex items-center justify-between gap-3 px-1 py-0.5">
      {/* AI Bot Profile & Status */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-800 font-serif font-bold text-lg shadow-2xs">
            ਪੰ
          </div>
          {/* Online Indicator Dot */}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-white"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
              {dict.pageTitle || "Pankh AI"}
            </h1>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-300">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              <span>PAU/ICAR Verified</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 leading-tight">
            {birdType ? `${birdType} Flock Specialist` : "Punjab Poultry Assistant"} • 24/7 Health Advisory
          </p>
        </div>
      </div>

      {/* Right Side: New Chat Button */}
      {hasMessages && onClearChat && (
        <button
          type="button"
          onClick={onClearChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 hover:text-stone-900 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
          title="Start fresh conversation"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">New Chat / ਨਵੀਂ ਚੈਟ</span>
        </button>
      )}
    </div>
  );
}
