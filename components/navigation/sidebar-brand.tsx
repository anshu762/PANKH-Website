"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { NotificationBell } from "@/components/common/notification-bell";

export function SidebarBrand() {
  const { t } = useLanguage();

  return (
    <div className="h-20 flex items-center justify-between px-5 border-b border-stone-200/80 bg-white/70">
      <Link href="/dashboard" className="flex items-center space-x-3 group">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm border border-amber-600/30 group-hover:scale-105 transition-transform duration-200">
          ਪੰ
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-serif text-xl font-bold tracking-tight text-pankh-clay leading-none">
              {t.common.platformName}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
              Active
            </span>
          </div>
          <span className="text-[10px] text-stone-500 font-sans mt-0.5 leading-tight">
            Punjab Poultry Intelligence
          </span>
        </div>
      </Link>
      <NotificationBell />
    </div>
  );
}
