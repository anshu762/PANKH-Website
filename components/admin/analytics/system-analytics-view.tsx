"use client";

import React from "react";
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
import {
  Users as UsersIcon,
  Activity as ActivityIcon,
  AlertTriangle as AlertTriangleIcon,
  Database as DatabaseIcon,
  Calendar as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle2,
  Filter,
} from "lucide-react";
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
    { name: "Active Batches", count: funnel.activeBatches, color: "#1E1B4B", desc: "Commercial flocks currently in production" },
    { name: "Daily Check-ins", count: funnel.totalCheckins, color: "#0284C7", desc: "Daily logs filed by farm supervisors" },
    { name: "Alerts Triggered", count: funnel.totalAlerts, color: "#D97706", desc: "RED & AMBER Sentinel thresholds exceeded" },
    { name: "Vet Cases Created", count: funnel.casesCreated, color: "#EA580C", desc: "Escalated to verified veterinary specialists" },
    { name: "Cases Resolved", count: funnel.casesResolved, color: "#059669", desc: "Clinical diagnosis & intervention closed" },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header with Telemetry Window */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              System Telemetry & Platform Adoption Analytics
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
              LIVE METRICS
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            DAU/WAU stickiness, check-in completion rates, and Sentinel alert conversion funnels
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-600 bg-[#FAF9F5] px-3 py-1.5 rounded-xl border border-stone-200/80 shrink-0">
          <CalendarIcon className="h-3.5 w-3.5 text-amber-800" />
          <span>Last 14 Days Telemetry Window</span>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* DAU / WAU */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-mono uppercase text-stone-500 font-bold flex items-center justify-between">
            <span>DAU / WAU</span>
            <UsersIcon className="h-4 w-4 text-amber-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-pankh-clay">{dau}</span>
            <span className="text-sm font-mono text-stone-500">/ {wau}</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Stickiness: <strong className="text-amber-800 font-mono">{stickinessRatio}%</strong> (DAU/WAU)
          </p>
        </div>

        {/* Check-in Completion Rate */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-mono uppercase text-stone-500 font-bold flex items-center justify-between">
            <span>Check-in Rate</span>
            <ActivityIcon className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-700">
            {funnel.checkinCompletionRate}%
          </div>
          <p className="text-[11px] text-stone-500">
            {funnel.checkinsToday} logged today ({funnel.activeBatches} active flocks)
          </p>
        </div>

        {/* Alert Rate */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-mono uppercase text-stone-500 font-bold flex items-center justify-between">
            <span>Alert Rate</span>
            <AlertTriangleIcon className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-3xl font-mono font-bold text-amber-800">
            {funnel.alertRate}%
          </div>
          <p className="text-[11px] text-stone-500">
            {funnel.redAlerts} RED, {funnel.amberAlerts} AMBER of {funnel.totalAlerts}
          </p>
        </div>

        {/* Data Completeness */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="text-[11px] font-mono uppercase text-stone-500 font-bold flex items-center justify-between">
            <span>Data Completeness</span>
            <DatabaseIcon className="h-4 w-4 text-indigo-700" />
          </div>
          <div className="text-3xl font-mono font-bold text-indigo-900">
            {funnel.dataCompletenessRate}%
          </div>
          <p className="text-[11px] text-stone-500">
            Logs with feed, water & shed temp
          </p>
        </div>
      </div>

      {/* 3. 14-Day Activity Trend Chart */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
              <TrendingUpIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                14-Day Operational Activity Trend
              </h3>
              <p className="text-[11px] text-stone-500">
                Daily active farmers vs field check-ins submitted across Punjab
              </p>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={activityTrend}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E5E4" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#78716C", fontFamily: "monospace" }}
                tickFormatter={(str) => str.slice(5)} // MM-DD
                axisLine={{ stroke: "#E7E5E4" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#78716C", fontFamily: "monospace" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF9F5",
                  borderColor: "#E7E5E4",
                  borderRadius: "1rem",
                  fontSize: "12px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
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
                stroke="#D97706"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLogs)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Surveillance & Case Escalation Conversion Funnel */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-800">
              <ActivityIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Sentinel Surveillance to Clinical Resolution Funnel
              </h3>
              <p className="text-[11px] text-stone-500">
                Progression from monitored batches through daily telemetry, alert triage, and specialist resolution
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {funnelStages.map((stage, idx) => {
            const isFirst = idx === 0;
            const prevCount = idx > 0 ? funnelStages[idx - 1].count : null;
            const convRate = prevCount && prevCount > 0
              ? Math.round((stage.count / prevCount) * 100)
              : null;

            return (
              <div
                key={stage.name}
                className="p-4 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-stone-600 font-bold">
                      Stage {idx + 1}
                    </span>
                    {convRate !== null && (
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                        {convRate}% from prev
                      </span>
                    )}
                  </div>
                  <h4 className="font-serif font-bold text-sm text-pankh-clay">
                    {stage.name}
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-tight">
                    {stage.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200">
                  <div className="text-2xl font-bold font-mono text-pankh-clay">
                    {stage.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
