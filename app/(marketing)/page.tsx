"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/common/language-selector";
import { useLanguage } from "@/hooks/use-language";
import { HeroSection } from "@/components/marketing/hero-section";
import { ProblemSection } from "@/components/marketing/problem-section";
import { FourModulesSection } from "@/components/marketing/four-modules-section";
import { HowAiAnswersSection } from "@/components/marketing/how-ai-answers-section";
import { SafetyTrustSection } from "@/components/marketing/safety-trust-section";
import { LanguageAccessibilitySection } from "@/components/marketing/language-accessibility-section";
import { FooterSection } from "@/components/marketing/footer-section";

export default function MarketingPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-pankh-marigold selection:text-white">
      {/* Sticky Header Navigation */}
      <header className="border-b border-border/80 sticky top-0 bg-background/90 backdrop-blur-md z-40 transition-colors">
        <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-serif text-2xl font-bold tracking-tight text-pankh-clay">
                {t.common.platformName}
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-xs font-medium border-amber-300 text-amber-950 bg-amber-50/50">
                {t.common.tagline}
              </Badge>
            </Link>
          </div>

          <nav className="flex items-center space-x-3 sm:space-x-4">
            {/* Smooth Scroll Links on Desktop */}
            <div className="hidden md:flex items-center space-x-5 text-xs font-medium text-stone-600 mr-2">
              <a href="#how-it-works" className="hover:text-pankh-clay transition-colors">
                Modules
              </a>
              <Link href="/login" className="hover:text-pankh-clay transition-colors">
                Vet Network
              </Link>
            </div>

            {/* Language Selector Pill */}
            <LanguageSelector variant="pill" />

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-xs sm:text-sm min-h-[40px]">
                {t.common.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium text-xs sm:text-sm bg-pankh-clay hover:bg-stone-800 text-white min-h-[40px] px-4 shadow-xs">
                {t.common.register}
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Page Content Composed of the 6 Grounded Sections */}
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <FourModulesSection />
        <HowAiAnswersSection />
        <SafetyTrustSection />
        <LanguageAccessibilitySection />
      </main>

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}
