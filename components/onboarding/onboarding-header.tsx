"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/common/language-selector";

export function OnboardingHeader() {
  const { t } = useLanguage();

  return (
    <header className="border-b border-stone-200/90 bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
      <div className="container mx-auto px-4 h-16 max-w-4xl flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm border border-amber-600/30">
            ਪੰ
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-pankh-clay leading-tight">
              {t.common.platformName}
            </span>
            <span className="text-[10px] text-amber-950/70 font-mono font-medium leading-none">
              Farm Onboarding
            </span>
          </div>
        </Link>
        <LanguageSelector variant="pill" />
      </div>
    </header>
  );
}
