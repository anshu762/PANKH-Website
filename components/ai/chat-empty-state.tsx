"use client";

import React from "react";
import { Bot } from "lucide-react";

export function ChatEmptyState() {
  return (
    <div className="py-12 text-center max-w-md mx-auto space-y-3">
      <div className="h-12 w-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center mx-auto text-amber-800 shadow-xs">
        <Bot className="h-6 w-6" />
      </div>
      <h3 className="font-serif text-lg font-bold text-pankh-clay">
        Pankh AI Assistant Ready
      </h3>
      <p className="text-xs text-stone-600 leading-relaxed">
        Ask questions about feed management, chick health, heat stress, vaccines, or biosecurity in Punjabi, Hindi, or English.
      </p>
    </div>
  );
}
