"use client";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSelector } from "@/components/common/language-selector";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShieldAlert, Sliders, Database } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { Session } from "next-auth";

interface AdminDashboardViewProps {
  session: Session | null;
}

export function AdminDashboardView({ session }: AdminDashboardViewProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-muted/10">
      <header className="border-b bg-background sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold tracking-tight text-primary">
              {t.common.platformName} {t.admin.consoleTitle}
            </span>
            <Badge variant="destructive" className="text-xs">
              {session?.user?.role || "ADMIN"}
            </Badge>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-xs sm:text-sm text-muted-foreground hidden md:inline">
              {session?.user?.email}
            </span>
            <LanguageSelector variant="pill" />
            <SignOutButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold">{t.admin.welcomeBannerTitle}</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {t.admin.welcomeBannerDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.admin.usersCardTitle}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.admin.usersCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.admin.usersCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.admin.thresholdsCardTitle}
              </CardTitle>
              <Sliders className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.admin.thresholdsCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.admin.thresholdsCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.admin.auditCardTitle}
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.admin.auditCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.admin.auditCardHint}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {t.admin.kbCardTitle}
              </CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {t.admin.kbCardValue}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {t.admin.kbCardHint}
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
