"use client";

import React from "react";
import { useLanguage } from "@/hooks/use-language";
import { DashboardHeroBanner } from "./dashboard-hero-banner";
import { DashboardPulseBar } from "./dashboard-pulse-bar";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardModuleCards } from "./dashboard-module-cards";
import { DashboardRecentActivity } from "./dashboard-recent-activity";

interface FarmerHomeViewProps {
  farmer: any;
  farm: any;
  batch: any;
  todayLog: any;
  latestAlert: any;
  recentAlerts?: any[];
  recentLogs?: any[];
  flockCycle?: {
    day: number;
    targetDays: number;
    livability: number;
    progressPercent: number;
  } | null;
  weather?: {
    temp: number;
    condition: string;
    humidity: number;
    heatRisk: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
    recommendation: string;
  };
  economics: {
    totalSpend: number;
    totalRevenue: number;
    netMargin: number;
    estimatedCostPerBird?: number;
  };
}

export function FarmerHomeView({
  farmer,
  farm,
  batch,
  todayLog,
  latestAlert,
  recentAlerts = [],
  recentLogs = [],
  flockCycle,
  weather,
  economics,
}: FarmerHomeViewProps) {
  const { lang } = useLanguage();

  return (
    <div key={lang} className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Editorial Hero & Batch Gauge */}
      <DashboardHeroBanner
        farmer={farmer}
        farm={farm}
        batch={batch}
        flockCycle={flockCycle || null}
      />

      {/* 2. Live Weather & Check-in Pulse Bar */}
      <DashboardPulseBar
        weather={weather}
        todayLog={todayLog}
      />

      {/* 3. Fast Operational Shortcuts */}
      <DashboardQuickActions />

      {/* 4. Four Core Distinct Modules */}
      <DashboardModuleCards
        batch={batch}
        todayLog={todayLog}
        latestAlert={latestAlert}
        economics={economics}
      />

      {/* 5. Live Activity & Surveillance Feed */}
      <DashboardRecentActivity
        recentAlerts={recentAlerts}
        recentLogs={recentLogs}
      />
    </div>
  );
}
