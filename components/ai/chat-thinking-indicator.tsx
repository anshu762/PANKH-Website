"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface ChatThinkingIndicatorProps {
  message?: string;
}

export function ChatThinkingIndicator({
  message = "Analyzing with Punjab poultry knowledge...",
}: ChatThinkingIndicatorProps) {
  return (
    <div className="flex justify-start gap-2.5 items-center animate-pulse">
      <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-400 text-amber-800 flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-xs">
        <RefreshCw className="h-4 w-4 animate-spin text-amber-700" />
      </div>
      <div className="bg-white rounded-2xl border border-stone-200 px-4 py-2.5 shadow-xs flex items-center gap-2">
        <span className="text-xs text-stone-600 font-medium">
          {message}
        </span>
      </div>
    </div>
  );
}
