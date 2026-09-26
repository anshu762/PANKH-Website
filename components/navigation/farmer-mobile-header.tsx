"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/common/language-selector";

export function FarmerMobileHeader() {
  const { t } = useLanguage();

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/90 h-14 px-4 flex items-center justify-between shadow-2xs">
      <Link href="/dashboard" className="flex items-center space-x-2.5">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-serif font-bold text-base shadow-xs border border-amber-600/30">
          ਪੰ
        </div>
        <span className="font-serif text-lg font-bold tracking-tight text-pankh-clay">
          {t.common.platformName}
        </span>
      </Link>
      <LanguageSelector variant="pill" />
    </header>
  );
}
