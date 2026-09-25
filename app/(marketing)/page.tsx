"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSelector } from "@/components/common/language-selector";
import { useLanguage } from "@/hooks/use-language";
import {
  ShieldAlert,
  Stethoscope,
  LineChart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MarketingPage() {
  const { t, lang } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/85 backdrop-blur-md z-30 transition-all">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-black tracking-tight text-primary">
                {t.common.platformName}
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-xs font-medium">
                {t.common.tagline}
              </Badge>
            </Link>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Premium Language Switcher in Header */}
            <LanguageSelector variant="pill" />

            <div className="h-4 w-px bg-border hidden sm:block" />

            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium">
                {t.common.login}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-medium shadow-sm">
                {t.common.register}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 sm:py-28 px-4 text-center max-w-4xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-medium border border-border/40 shadow-xs"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span>{t.marketing.badge}</span>
          </motion.div>

          <motion.h1
            key={lang + "-title"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none"
          >
            {t.marketing.heroTitle}
          </motion.h1>

          <motion.p
            key={lang + "-desc"}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            {t.marketing.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-md">
                {t.marketing.heroCtaPrimary} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                {t.marketing.heroCtaSecondary}
              </Button>
            </Link>
          </motion.div>

          {/* Value Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Punjabi Voice & Text</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Sentinel Early Risk Detection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Verified Punjab Vet Network</span>
            </div>
          </div>
        </section>

        {/* 4 Modules Overview */}
        <section className="py-20 border-t bg-muted/20">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {t.marketing.modulesTitle}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                {t.marketing.modulesSubtitle}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:border-primary/50 transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">
                    {t.marketing.modulePankhAiTitle}
                  </CardTitle>
                  <CardDescription className="font-medium text-xs text-foreground/80">
                    {t.marketing.modulePankhAiSub}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  {t.marketing.modulePankhAiDesc}
                </CardContent>
              </Card>

              <Card className="hover:border-amber-500/50 transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-3">
                    <ShieldAlert className="h-6 w-6 text-amber-600" />
                  </div>
                  <CardTitle className="text-lg">
                    {t.marketing.moduleSentinelTitle}
                  </CardTitle>
                  <CardDescription className="font-medium text-xs text-foreground/80">
                    {t.marketing.moduleSentinelSub}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  {t.marketing.moduleSentinelDesc}
                </CardContent>
              </Card>

              <Card className="hover:border-blue-500/50 transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-3">
                    <Stethoscope className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">
                    {t.marketing.moduleConnectTitle}
                  </CardTitle>
                  <CardDescription className="font-medium text-xs text-foreground/80">
                    {t.marketing.moduleConnectSub}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  {t.marketing.moduleConnectDesc}
                </CardContent>
              </Card>

              <Card className="hover:border-emerald-500/50 transition-all duration-200 hover:shadow-md">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-3">
                    <LineChart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">
                    {t.marketing.moduleEconomicsTitle}
                  </CardTitle>
                  <CardDescription className="font-medium text-xs text-foreground/80">
                    {t.marketing.moduleEconomicsSub}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground leading-relaxed">
                  {t.marketing.moduleEconomicsDesc}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground bg-background">
        <div className="container mx-auto px-4 max-w-4xl space-y-3">
          <p>{t.marketing.footerText}</p>
        </div>
      </footer>
    </div>
  );
}
