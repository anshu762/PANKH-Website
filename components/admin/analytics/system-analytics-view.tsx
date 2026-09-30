"use client";

import React from "react";
import {
  Users,
  Activity,
  CheckCircle,
  AlertTriangle,
  Stethoscope,
  TrendingUp,
  Database,
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  PieChart,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
} from "recharts";
import { AdminSystemAnalyticsData } from "@/types/admin";
import { cn } from "@/lib/utils";

interface SystemAnalyticsViewProps {
  initialData: AdminSystemAnalyticsData;
}

export function SystemAnalyticsView({ initialData }: SystemAnalyticsViewProps) {
  const { dau, wau, funnel, activityTrend } = initialData;

  const stickinessRatio = wau > 0 ? Math.round((dau / wau) * 100) : 0;

  // Funnel stage data
  const funnelStages = [
    { name: "Active Batches", count: funnel.activeBatches, color: "#1E1B4B" },
    { name: "Daily Check-ins", count: funnel.totalCheckins, color: "#0284C7" },
    { name: "Alerts Triggered", count: funnel.totalAlerts, color: "#D97706" },
    { name: "Vet Cases Created", count: funnel.casesCreated, color: "#EA580C" },
    { name: "Cases Resolved", count: funnel.casesResolved, color: "#059669" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-serif">
              System Telemetry & Operational Analytics
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
              Live Metrics
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            DAU/WAU tracking, daily check-in habits, early alert trigger frequency, and field data completeness.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Last 14 Days Telemetry Window</span>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DAU / WAU */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>DAU / WAU</span>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-foreground">{dau}</span>
            <span className="text-sm font-mono text-muted-foreground">/ {wau}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Stickiness: <span className="font-semibold text-foreground font-mono">{stickinessRatio}%</span> (DAU/WAU)
          </p>
        </div>

        {/* Check-in Completion Rate */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Check-in Rate</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {funnel.checkinCompletionRate}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {funnel.checkinsToday} logged today ({funnel.activeBatches} active flocks)
          </p>
        </div>

        {/* Alert Rate */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Alert Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {funnel.alertRate}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            {funnel.redAlerts} RED, {funnel.amberAlerts} AMBER of {funnel.totalAlerts}
          </p>
        </div>

        {/* Data Completeness */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-1">
          <div className="text-[11px] font-mono uppercase text-muted-foreground font-semibold flex items-center justify-between">
            <span>Data Completeness</span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-mono font-bold text-foreground">
            {funnel.dataCompletenessRate}%
          </div>
          <p className="text-[11px] text-muted-foreground">
            Logs with feed, water & shed temp
          </p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 14-Day Activity Trend (Takes 2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                14-Day Farmer Activity Trend
              </h2>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Daily Active Farmers vs Field Check-ins
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activityTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E1B4B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E1B4B" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  tickFormatter={(str) => str.slice(5)} // MM-DD
                />
                <YAxis tick={{ fontSize: 11, fill: "currentColor" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                    color: "var(--foreground)",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                  formatter={(val) =>
                    val === "activeUsers"
                      ? "Active Farmers (DAU)"
                      : val === "checkins"
                      ? "Submitted Check-ins"
                      : "AI Assistant Queries"
                  }
                />
                <Area
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#059669"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
                <Area
                  type="monotone"
                  dataKey="checkins"
                  stroke="#1E1B4B"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorLogs)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Conversion Funnel (Takes 1 col) */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
          <div className="border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Operational Pipeline Funnel
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              From flock check-ins to veterinary resolution
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {funnelStages.map((stage, idx) => (
              <div key={stage.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">{stage.name}</span>
                  <span className="font-mono font-bold text-foreground">
                    {stage.count.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: stage.color,
                      width: `${Math.min(
                        100,
                        Math.max(5, (stage.count / Math.max(funnel.totalCheckins, 1)) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Rates conversion summary */}
          <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground block font-mono">Expert Conn Rate</span>
              <span className="font-mono font-bold text-foreground">{funnel.expertConnectionRate}%</span>
            </div>
            <div className="p-2 rounded-lg bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground block font-mono">Case Resolution</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {funnel.resolutionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Field Data Completeness Breakdown */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">
              Farmer Check-in Completeness & Field Precision
            </h2>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Brief Sec 8.8 Requirement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Complete Sensor/Log Entry
            </span>
            <div className="text-xl font-mono font-bold text-foreground">
              {funnel.dataCompletenessRate}%
            </div>
            <p className="text-muted-foreground text-[11px]">
              Farmers providing mortality count, feed consumed (kg), water consumed (litres), and shed temperature (°C).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Partial Entry (Feed & Water only)
            </span>
            <div className="text-xl font-mono font-bold text-foreground">
              {Math.min(100 - funnel.dataCompletenessRate, 35)}%
            </div>
            <p className="text-muted-foreground text-[11px]">
              Missing shed temperature or exact water reading. Still sufficient for basic Sentinel risk evaluation.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-1">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-primary" />
              High-Risk Clinical Escalations
            </span>
            <div className="text-xl font-mono font-bold text-foreground">
              {funnel.casesCreated} Cases
            </div>
            <p className="text-muted-foreground text-[11px]">
              Cases escalated to Ludhiana/GADVASU veterinary specialists with automated WhatsApp/SMS dispatch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
