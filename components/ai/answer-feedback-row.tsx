"use client";

import React, { useState } from "react";
import { ThumbsUp, ThumbsDown, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { aiServiceClient } from "@/services/ai.client";

interface AnswerFeedbackRowProps {
  messageId: string;
  initialFeedback?: string | null;
  labels: {
    helpful: string;
    notHelpful: string;
    continuing: string;
  };
}

export function AnswerFeedbackRow({
  messageId,
  initialFeedback,
  labels,
}: AnswerFeedbackRowProps) {
  const [feedback, setFeedback] = useState<string | null>(initialFeedback || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (
    type: "HELPFUL" | "NOT_HELPFUL" | "STILL_CONTINUING"
  ) => {
    if (isSubmitting || feedback === type) return;
    setFeedback(type);
    setIsSubmitting(true);
    try {
      await aiServiceClient.submitFeedback({ messageId, feedback: type });
    } catch (err) {
      console.error("Feedback submit error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span className="text-stone-500 text-[11px]">Was this answer accurate?</span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => handleFeedback("HELPFUL")}
          disabled={isSubmitting}
          className={cn(
            "px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 min-h-[36px]",
            feedback === "HELPFUL"
              ? "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold"
              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
          )}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>{labels.helpful}</span>
        </button>

        <button
          type="button"
          onClick={() => handleFeedback("NOT_HELPFUL")}
          disabled={isSubmitting}
          className={cn(
            "px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 min-h-[36px]",
            feedback === "NOT_HELPFUL"
              ? "bg-rose-100 border-rose-300 text-rose-900 font-bold"
              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
          )}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>{labels.notHelpful}</span>
        </button>

        <button
          type="button"
          onClick={() => handleFeedback("STILL_CONTINUING")}
          disabled={isSubmitting}
          className={cn(
            "px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors flex items-center gap-1.5 min-h-[36px]",
            feedback === "STILL_CONTINUING"
              ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
              : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
          )}
        >
          <RefreshCw className="h-3 w-3" />
          <span>{labels.continuing}</span>
        </button>
      </div>
    </div>
  );
}
