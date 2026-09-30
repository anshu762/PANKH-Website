"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CheckinUnitToggleProps {
  unit: "KG" | "BAGS";
  onChange: (unit: "KG" | "BAGS") => void;
  kgLabel?: string;
  bagsLabel?: string;
}

export function CheckinUnitToggle({
  unit,
  onChange,
  kgLabel = "Kg",
  bagsLabel = "Bags (50kg)",
}: CheckinUnitToggleProps) {
  return (
    <div className="inline-flex items-center p-1 bg-stone-100 rounded-xl border border-stone-200">
      <button
        type="button"
        onClick={() => onChange("KG")}
        className={cn(
          "px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px]",
          unit === "KG"
            ? "bg-white text-pankh-clay shadow-xs font-semibold"
            : "text-stone-500 hover:text-stone-800"
        )}
      >
        {kgLabel}
      </button>
      <button
        type="button"
        onClick={() => onChange("BAGS")}
        className={cn(
          "px-3 py-1.5 text-xs font-bold rounded-lg transition-all min-h-[36px]",
          unit === "BAGS"
            ? "bg-white text-pankh-clay shadow-xs font-semibold"
            : "text-stone-500 hover:text-stone-800"
        )}
      >
        {bagsLabel}
      </button>
    </div>
  );
}
