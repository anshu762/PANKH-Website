"use client";

import React from "react";
import Link from "next/link";
import { Warehouse, ChevronRight } from "lucide-react";

export function SidebarFlockBadge() {
  return (
    <div className="px-3 pt-3 pb-1">
      <Link
        href="/dashboard"
        className="block p-3 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-white border border-amber-300/80 shadow-2xs hover:border-amber-400 transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0">
              <Warehouse className="h-3.5 w-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-pankh-clay block leading-none">
                Shed 1 • Commercial
              </span>
              <span className="text-[10px] text-stone-500 font-mono mt-0.5 block">
                Punjab Extension
              </span>
            </div>
          </div>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
        </div>
      </Link>
    </div>
  );
}
