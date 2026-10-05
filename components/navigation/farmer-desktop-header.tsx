"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/common/language-selector";
import { NotificationBell } from "@/components/common/notification-bell";
import { ShieldCheck, User } from "lucide-react";
import type { Session } from "next-auth";

interface FarmerDesktopHeaderProps {
  session: Session | null;
}

export function FarmerDesktopHeader({ session }: FarmerDesktopHeaderProps) {
  const { t } = useLanguage();
  const userName = session?.user?.name || "Farmer";
  const userInitial = userName[0]?.toUpperCase() || "F";

  return (
    <header className="hidden md:flex h-16 w-full bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/90 px-6 lg:px-8 items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: Platform & Surveillance Live Context */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-sm tracking-tight text-pankh-clay">
            {t.common.platformName} {t.farmer.portalTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>Sentinel Live</span>
          </span>
        </div>
      </div>

      {/* Right: Global Actions (Language, Notification Bell, User Avatar) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language Selector */}
        <LanguageSelector variant="pill" />

        {/* Global Notification Center */}
        <NotificationBell />

        {/* User Profile Mini Badge */}
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-white hover:bg-stone-100 border border-stone-200/90 shadow-2xs transition-all group"
          title="View profile & farm settings"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            {userInitial}
          </div>
          <span className="text-xs font-semibold text-stone-700 group-hover:text-pankh-clay max-w-[120px] truncate">
            {userName}
          </span>
        </Link>
      </div>
    </header>
  );
}
