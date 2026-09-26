"use client";

import React, { useRef } from "react";
import { Send } from "lucide-react";

interface ChatInputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  sendLabel?: string;
}

export function ChatInputBar({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type your question in Punjabi, Hindi, or English...",
  sendLabel = "Send",
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend(value);
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-300 p-2 sm:p-2.5 shadow-xs focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={2}
        placeholder={placeholder}
        className="flex-1 text-xs sm:text-sm p-2 bg-transparent text-stone-900 focus:outline-none resize-none leading-relaxed min-h-[44px]"
      />
      <button
        type="button"
        onClick={() => onSend(value)}
        disabled={disabled || !value.trim()}
        className="px-4 py-2.5 rounded-xl bg-pankh-clay hover:bg-stone-800 disabled:opacity-40 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-1.5 shrink-0 min-h-[44px] cursor-pointer disabled:cursor-not-allowed"
      >
        <span>{sendLabel}</span>
        <Send className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
