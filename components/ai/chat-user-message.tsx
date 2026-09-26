"use client";

import React from "react";
import { User } from "lucide-react";

interface ChatUserMessageProps {
  content: string;
  inputMode: "TEXT" | "VOICE" | "PHOTO";
}

export function ChatUserMessage({ content, inputMode }: ChatUserMessageProps) {
  return (
    <div className="flex justify-end gap-2.5 items-start">
      <div className="max-w-xl bg-pankh-clay text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs space-y-1">
        <div className="flex items-center justify-between gap-3 text-[10px] text-stone-300 font-mono">
          <span>Farmer</span>
          {inputMode !== "TEXT" && (
            <span className="uppercase px-1.5 py-0.5 rounded bg-white/20 text-white font-bold tracking-wider text-[9px]">
              {inputMode}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
          {content}
        </p>
      </div>
      <div className="h-8 w-8 rounded-full bg-stone-300 flex items-center justify-center text-stone-700 shrink-0 text-xs font-bold shadow-xs">
        <User className="h-4 w-4" />
      </div>
    </div>
  );
}
