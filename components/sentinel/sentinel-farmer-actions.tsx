"use client";

import React, { useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { FarmerActionType } from "@/types/sentinel";
import { CheckCircle2, AlertCircle, PhoneCall, RefreshCw, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { submitFarmerAlertAction } from "@/actions/sentinel";

interface SentinelFarmerActionsProps {
  alertId?: string;
  initialAction?: FarmerActionType | null;
  acknowledged?: boolean;
}

export function SentinelFarmerActions({
  alertId,
  initialAction,
  acknowledged,
}: SentinelFarmerActionsProps) {
  const { t } = useLanguage();
  const s = t.sentinel;

  const [currentAction, setCurrentAction] = useState<FarmerActionType | null>(
    initialAction || null
  );
  const [isUpdating, setIsUpdating] = useState<FarmerActionType | null>(null);
  const [feedback, setFeedback] = useState<string | null>(
    acknowledged ? "Alert acknowledged by farm manager" : null
  );

  if (!alertId) return null;

  const handleActionClick = async (action: FarmerActionType) => {
    setIsUpdating(action);
    setFeedback(null);

    try {
      const res = await submitFarmerAlertAction(alertId, action);
      if (res.error) {
        throw new Error(res.error);
      }

      setCurrentAction(action);
      setFeedback(s.actionFeedback);
    } catch (err: any) {
      console.error("Failed to submit action:", err);
      setFeedback(err.message || "Failed to update action");
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="p-6 sm:p-7 rounded-3xl border-2 border-stone-200 bg-white space-y-4 shadow-xs">
      <div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay">
          {s.farmerActionsTitle}
        </h3>
        <p className="text-xs text-stone-500">{s.farmerActionsDesc}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Resolved */}
        <button
          type="button"
          disabled={Boolean(isUpdating)}
          onClick={() => handleActionClick("RESOLVED")}
          className={cn(
            "p-3.5 rounded-2xl border-2 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[50px]",
            currentAction === "RESOLVED"
              ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-500/20"
              : "border-stone-200 bg-stone-50 hover:bg-emerald-50/50 hover:border-emerald-300 text-stone-700"
          )}
        >
          {isUpdating === "RESOLVED" ? (
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-700" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
          )}
          <span>{s.actionResolved}</span>
        </button>

        {/* 2. Still Happening */}
        <button
          type="button"
          disabled={Boolean(isUpdating)}
          onClick={() => handleActionClick("STILL_HAPPENING")}
          className={cn(
            "p-3.5 rounded-2xl border-2 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[50px]",
            currentAction === "STILL_HAPPENING"
              ? "border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-500/20"
              : "border-stone-200 bg-stone-50 hover:bg-amber-50/50 hover:border-amber-300 text-stone-700"
          )}
        >
          {isUpdating === "STILL_HAPPENING" ? (
            <RefreshCw className="h-4 w-4 animate-spin text-amber-700" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
          )}
          <span>{s.actionStillHappening}</span>
        </button>

        {/* 3. Vet Contacted */}
        <button
          type="button"
          disabled={Boolean(isUpdating)}
          onClick={() => handleActionClick("VET_CONTACTED")}
          className={cn(
            "p-3.5 rounded-2xl border-2 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[50px]",
            currentAction === "VET_CONTACTED"
              ? "border-orange-600 bg-orange-50 text-orange-950 font-bold ring-2 ring-orange-500/20"
              : "border-stone-200 bg-stone-50 hover:bg-orange-50/50 hover:border-orange-300 text-stone-700"
          )}
        >
          {isUpdating === "VET_CONTACTED" ? (
            <RefreshCw className="h-4 w-4 animate-spin text-orange-700" />
          ) : (
            <PhoneCall className="h-4 w-4 text-orange-700 shrink-0" />
          )}
          <span>{s.actionVetContacted}</span>
        </button>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
