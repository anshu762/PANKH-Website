"use client";

import React from "react";
import Link from "next/link";
import { Stethoscope, ArrowRight } from "lucide-react";

export function SidebarEmergencyCard() {
  return (
    <div className="px-3 py-2">
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-amber-50/60 border border-orange-200/90 shadow-2xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <Stethoscope className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-bold text-pankh-clay block leading-tight">
            Vet Emergency Help
          </span>
        </div>
        <p className="text-[11px] text-stone-600 leading-tight">
          GADVASU & district poultry doctors on standby.
        </p>
        <Link
          href="/dashboard/connect"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-pankh-phulkari hover:underline pt-0.5"
        >
          <span>Connect Now</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
