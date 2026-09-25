"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSelector } from "@/components/common/language-selector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Bell, FileText, IndianRupee } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { Session } from "next-auth";

interface FarmerDashboardViewProps {
  session: Session | null;
}

export function FarmerDashboardView({ session }: FarmerDashboardViewProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-primary">
              {t.common.platformName} {t.farmer.portalTitle}
            </span>
            <Badge variant="secondary" className="text-xs">
              {t.common.role}: {session?.user?.role || "FARMER"}
            </Badge>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">
              {t.common.welcome}, {session?.user?.name || session?.user?.email}
            </span>
            <LanguageSelector variant="pill" />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t.farmer.welcomeBannerTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t.farmer.welcomeBannerDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.farmer.dailyLogCardTitle}
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.farmer.dailyLogCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.farmer.dailyLogCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.farmer.sentinelCardTitle}
              </CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                {t.farmer.sentinelCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.farmer.sentinelCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.farmer.casesCardTitle}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.farmer.casesCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.farmer.casesCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.farmer.economicsCardTitle}
              </CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.farmer.economicsCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.farmer.economicsCardHint}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
