"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, Check } from "lucide-react";

interface SymptomChipItem {
  id: string;
  label: string;
  subLabel?: string;
  isHighRisk?: boolean;
}

interface CheckinSymptomChipsProps {
  selectedSymptoms: string[];
  onChange: (symptoms: string[]) => void;
  items: SymptomChipItem[];
}

export function CheckinSymptomChips({
  selectedSymptoms,
  onChange,
  items,
}: CheckinSymptomChipsProps) {
  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      onChange(selectedSymptoms.filter((s) => s !== id));
    } else {
      onChange([...selectedSymptoms, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
      {items.map((item) => {
        const isSelected = selectedSymptoms.includes(item.id);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => toggleSymptom(item.id)}
            className={cn(
              "relative text-left p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between min-h-[58px] cursor-pointer select-none",
              item.isHighRisk && !isSelected
                ? "border-red-200 bg-red-50/20 hover:border-red-300"
                : isSelected
                ? item.isHighRisk
                  ? "border-red-500 bg-red-50 text-red-950 font-bold shadow-xs ring-2 ring-red-400/30"
                  : "border-amber-500 bg-amber-50 text-amber-950 font-bold shadow-xs ring-2 ring-amber-400/30"
                : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
            )}
          >
            <div className="flex items-start justify-between gap-1.5 w-full">
              <span className="text-xs sm:text-sm font-semibold leading-tight">
                {item.label}
              </span>
              <div
                className={cn(
                  "h-5 w-5 rounded-full flex items-center justify-center shrink-0 border transition-all",
                  isSelected
                    ? item.isHighRisk
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-pankh-marigold border-pankh-marigold text-white"
                    : "border-stone-300 bg-stone-50"
                )}
              >
                {isSelected ? (
                  <Check className="h-3 w-3 stroke-[3]" />
                ) : item.isHighRisk ? (
                  <AlertCircle className="h-3 w-3 text-red-400" />
                ) : null}
              </div>
            </div>

            {item.subLabel && (
              <span className="text-[11px] text-stone-500 mt-1 leading-none font-normal">
                {item.subLabel}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
