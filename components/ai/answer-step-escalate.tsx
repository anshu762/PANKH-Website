import React from "react";
import Link from "next/link";
import { AlertTriangle, Stethoscope } from "lucide-react";

interface AnswerStepEscalateProps {
  label: string;
  reason?: string | null;
  caseId?: string | null;
  buttonLabel: string;
}

export function AnswerStepEscalate({
  label,
  reason,
  caseId,
  buttonLabel,
}: AnswerStepEscalateProps) {
  return (
    <div className="p-4 rounded-xl bg-rose-50 border-2 border-rose-300 space-y-3 animate-in fade-in">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
            {label}
          </span>
          <p className="text-xs sm:text-sm text-rose-800 font-medium">
            {reason ||
              "Severe symptoms or mortality limit detected. Immediate physical examination by a registered veterinarian is strongly advised."}
          </p>
        </div>
      </div>

      <div className="pt-1 flex flex-wrap gap-2.5">
        <Link
          href={`/dashboard/connect${caseId ? `?caseId=${caseId}` : ""}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors min-h-[44px]"
        >
          <Stethoscope className="h-4 w-4" />
          <span>{buttonLabel}</span>
        </Link>
        {caseId && (
          <span className="inline-flex items-center text-[11px] text-rose-800 font-mono self-center">
            Case Record #{caseId.slice(-6)} Created
          </span>
        )}
      </div>
    </div>
  );
}
