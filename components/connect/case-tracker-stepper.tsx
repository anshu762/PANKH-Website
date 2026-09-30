"use client";

import { CaseStatus } from "@prisma/client";
import { Check, Clock, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

interface CaseTrackerStepperProps {
  currentStatus: CaseStatus;
  createdAt: Date | string;
  assignedVetName?: string | null;
  compact?: boolean;
}

const STEPS: { status: CaseStatus; number: number; key: "stepCreated" | "stepContacted" | "stepAppointment" | "stepAdviceReceived" | "stepResolved"; icon: typeof Clock }[] = [
  { status: CaseStatus.CREATED, number: 1, key: "stepCreated", icon: Clock },
  { status: CaseStatus.CONTACTED, number: 2, key: "stepContacted", icon: FileText },
  { status: CaseStatus.APPOINTMENT, number: 3, key: "stepAppointment", icon: Calendar },
  { status: CaseStatus.ADVICE_RECEIVED, number: 4, key: "stepAdviceReceived", icon: CheckCircle2 },
  { status: CaseStatus.RESOLVED, number: 5, key: "stepResolved", icon: Check },
];

const STATUS_ORDER: Record<CaseStatus, number> = {
  [CaseStatus.CREATED]: 1,
  [CaseStatus.CONTACTED]: 2,
  [CaseStatus.APPOINTMENT]: 3,
  [CaseStatus.ADVICE_RECEIVED]: 4,
  [CaseStatus.RESOLVED]: 5,
};

export function CaseTrackerStepper({
  currentStatus,
  createdAt,
  assignedVetName,
  compact = false,
}: CaseTrackerStepperProps) {
  const { t: dict } = useLanguage();
  const t = dict.connect;
  const currentStepNumber = STATUS_ORDER[currentStatus] || 1;

  const dateFormatted = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 md:p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-4 border-b border-stone-100 dark:border-stone-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2.5 py-1 rounded-full border border-orange-200 dark:border-orange-800">
            {t.openCasesTitle}
          </span>
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 mt-2">
            {assignedVetName ? `Consulting: ${assignedVetName}` : "Case In Progress"}
          </h3>
        </div>
        <div className="text-xs text-stone-700 dark:text-stone-300">
          Initiated: <span className="font-semibold text-stone-900 dark:text-stone-100">{dateFormatted}</span>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="relative">
        <div className="hidden sm:block absolute top-5 left-6 right-6 h-0.5 bg-stone-200 dark:bg-stone-700 -z-0" />
        <div
          className="hidden sm:block absolute top-5 left-6 h-0.5 bg-orange-600 transition-all duration-500 -z-0"
          style={{
            width: `${((Math.min(currentStepNumber, 5) - 1) / 4) * 100}%`,
          }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 sm:gap-2">
          {STEPS.map((step) => {
            const isCompleted = currentStepNumber > step.number;
            const isCurrent = currentStepNumber === step.number;
            const isUpcoming = currentStepNumber < step.number;

            return (
              <div
                key={step.status}
                className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative z-10"
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors duration-200 shadow-sm ${
                    isCompleted
                      ? "bg-emerald-600 text-white border-2 border-emerald-600"
                      : isCurrent
                      ? "bg-orange-600 text-white ring-4 ring-orange-100 dark:ring-orange-950 border-2 border-orange-600"
                      : "bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-2 border-stone-300 dark:border-stone-700"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white stroke-[2.5]" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>

                <div className="flex flex-col sm:items-center">
                  <span
                    className={`text-xs sm:text-sm font-semibold ${
                      isCurrent
                        ? "text-orange-700 dark:text-orange-400 font-bold"
                        : isCompleted
                        ? "text-stone-900 dark:text-stone-100 font-medium"
                        : "text-stone-600 dark:text-stone-300"
                    }`}
                  >
                    {t[step.key]}
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-orange-700 dark:text-orange-300 sm:mt-0.5">
                      Current Stage
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
