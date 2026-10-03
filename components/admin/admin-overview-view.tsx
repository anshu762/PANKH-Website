"use client";

import React from "react";
import Link from "next/link";
import {
  Users,
  AlertTriangle,
  Stethoscope,
  BookOpen,
  Sliders,
  MessageSquareWarning,
  LineChart,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Building2,
  Phone,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { AdminOverviewStats, AdminHighRiskAlertItem, AdminAiReviewItem } from "@/types/admin";
import { cn } from "@/lib/utils";

interface AdminOverviewViewProps {
  stats: AdminOverviewStats;
  recentAlerts: AdminHighRiskAlertItem[];
  recentAiFeedback: AdminAiReviewItem[];
}

export function AdminOverviewView({
  stats,
  recentAlerts,
  recentAiFeedback,
}: AdminOverviewViewProps) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Editorial Hero & Surveillance Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#FAF9F5] to-amber-50/40 border border-stone-200/90 p-6 sm:p-8 shadow-xs">
        {/* Subtle Phulkari Geometric Pattern Accent in Corner */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-950 font-mono text-[11px] font-bold tracking-tight shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600" />
                </span>
                Punjab State Poultry Surveillance
              </span>
              <span className="text-xs text-stone-500 font-sans hidden sm:inline">
                GADVASU Protocols Active
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-pankh-clay tracking-tight leading-[1.2]">
              Operations Command & <span className="font-serif italic font-semibold text-amber-900">Health Grid</span>
            </h1>

            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Real-time surveillance across commercial broiler & layer sheds in Ludhiana, Sangrur, Patiala, and surrounding poultry clusters.
            </p>
          </div>

          {/* Quick Real-Time Metrics Strip */}
          <div className="flex items-center gap-3 bg-white/95 backdrop-blur-xs p-3.5 sm:p-4 rounded-2xl border border-stone-200/90 shadow-2xs shrink-0">
            <div className="px-3 border-r border-stone-200">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                Active Batches
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-pankh-clay">
                {stats.activeBatches}
              </div>
            </div>

            <div className="px-3 border-r border-stone-200">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                Red Alerts
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-red-600">
                {stats.redAlertsCount}
              </div>
            </div>

            <div className="px-3">
              <div className="text-[10px] font-mono uppercase text-stone-500 font-bold">
                Open Cases
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-700">
                {stats.openCasesCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Distinct 4-Module Executive Stat Cards (Agrarian Grounded) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Module 1: Sentinel Early Disease Alert Surveillance */}
        <Link
          href="/admin/alerts"
          className={cn(
            "p-5 rounded-3xl border transition-all group shadow-2xs hover:shadow-xs relative overflow-hidden",
            stats.redAlertsCount > 0
              ? "bg-red-50/40 border-red-200 hover:border-red-400"
              : "bg-white border-stone-200/90 hover:border-stone-400"
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-red-900">
              Sentinel Surveillance
            </span>
            <div className={cn(
              "h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
              stats.redAlertsCount > 0 ? "bg-red-100 text-red-700" : "bg-stone-100 text-stone-600"
            )}>
              <AlertTriangle className={cn("h-4 w-4", stats.redAlertsCount > 0 && "animate-pulse text-red-600")} />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-pankh-clay">
              {stats.redAlertsCount}
            </span>
            <span className="text-xs font-bold font-mono text-red-700">
              Active RED
            </span>
          </div>

          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>{stats.openCasesCount} cases linked with vets</span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>

        {/* Module 2: Pankh AI Grounding & Safety Reviews */}
        <Link
          href="/admin/ai-review"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 hover:border-amber-400/80 transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-amber-900">
              AI Grounding & Safety
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-800 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
              <MessageSquareWarning className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-pankh-clay">
              {stats.pendingAiReviewsCount}
            </span>
            <span className="text-xs font-bold font-mono text-amber-800">
              Awaiting Review
            </span>
          </div>

          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>Negative feedback triage</span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>

        {/* Module 3: Pankh Connect Specialists & Diagnostic Labs */}
        <Link
          href="/admin/vetlab"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 hover:border-emerald-400/80 transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-emerald-900">
              Connect Directory
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Stethoscope className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-pankh-clay">
              {stats.verifiedVetCount}
            </span>
            <span className="text-xs font-bold font-mono text-emerald-800">
              Verified
            </span>
          </div>

          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>{stats.approvedKbSourcesCount} approved KB sources</span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>

        {/* Module 4: Registered Farmers & Farm Sheds */}
        <Link
          href="/admin/farmers"
          className="p-5 rounded-3xl bg-white border border-stone-200/90 hover:border-indigo-400/80 transition-all group shadow-2xs hover:shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-indigo-900">
              Farmers & Sheds
            </span>
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 text-indigo-800 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <Users className="h-4 w-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-pankh-clay">
              {stats.totalFarmers}
            </span>
            <span className="text-xs font-bold font-mono text-indigo-800">
              Farmers
            </span>
          </div>

          <p className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
            <span>{stats.totalFarms} commercial farms</span>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-all" />
          </p>
        </Link>
      </div>

      {/* 3. Priority Active Surveillance Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* High-Risk Alerts Surveillance Queue */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center text-red-700">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-pankh-clay">
                  High-Risk Alerts Awaiting Resolution
                </h3>
                <p className="text-[11px] text-stone-500">
                  Sorted by elapsed time since trigger
                </p>
              </div>
            </div>
            <Link
              href="/admin/alerts"
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
            >
              <span>Full Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-stone-300 transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pankh-clay font-serif text-sm">
                      {alert.farmName}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      ({alert.district})
                    </span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200">
                      RED
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-1 font-sans">
                    {alert.reason}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                    <span>{alert.farmerName}</span>
                    <span>•</span>
                    <a
                      href={`tel:${alert.farmerPhone}`}
                      className="text-amber-800 hover:underline flex items-center gap-1"
                    >
                      <Phone className="h-2.5 w-2.5" />
                      {alert.farmerPhone}
                    </a>
                    <span>•</span>
                    <span className="text-stone-400">{alert.hoursAgo}h ago</span>
                  </div>
                </div>

                <div className="shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200">
                  {alert.linkedCase ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 font-mono">
                      {alert.linkedCase.status}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700 font-mono">
                      Unescalated
                    </span>
                  )}
                  <Link
                    href="/admin/alerts"
                    className="text-[11px] font-bold text-amber-800 hover:underline"
                  >
                    Triage &gt;
                  </Link>
                </div>
              </div>
            ))}

            {recentAlerts.length === 0 && (
              <div className="py-10 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <span className="font-semibold text-stone-600">Zero active high-risk alerts in queue</span>
                <span className="text-[11px]">All commercial sheds operating within normal parameters</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Grounding & Safety Feedback Queue */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800">
                <MessageSquareWarning className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-pankh-clay">
                  Negative AI Feedback Queue
                </h3>
                <p className="text-[11px] text-stone-500">
                  Safety audits and GADVASU citation verification
                </p>
              </div>
            </div>
            <Link
              href="/admin/ai-review"
              className="text-xs font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 transition-colors"
            >
              <span>Audit Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentAiFeedback.slice(0, 4).map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-stone-200/90 space-y-1.5 text-xs hover:border-stone-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pankh-clay font-serif text-sm">
                    {msg.farmerName}
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Feedback: {msg.feedback}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2 italic">
                  "{msg.content}"
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-500 font-mono pt-1">
                  <span>Sources: {msg.sourceTitles.length} cited</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {recentAiFeedback.length === 0 && (
              <div className="py-10 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-1.5">
                <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                <span className="font-semibold text-stone-600">Zero pending negative feedback messages</span>
                <span className="text-[11px]">All AI assistant responses verified against knowledge sources</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Operational Desk Shortcuts Grid */}
      <div className="space-y-3">
        <h3 className="font-serif text-base font-bold text-pankh-clay">
          Direct Module Workspaces
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/admin/farmers"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
              <Users className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-amber-900 transition-colors">
                Farmers & Sheds
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {stats.totalFarmers} registered
              </span>
            </div>
          </Link>

          <Link
            href="/admin/vetlab"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-emerald-900 transition-colors">
                Vet & Lab Directory
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {stats.verifiedVetCount} verified specialists
              </span>
            </div>
          </Link>

          <Link
            href="/admin/knowledge"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-amber-900 transition-colors">
                Knowledge Base
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {stats.approvedKbSourcesCount} approved sources
              </span>
            </div>
          </Link>

          <Link
            href="/admin/rules"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors">
              <Sliders className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-indigo-900 transition-colors">
                Alert Rules & Audit
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                Sentinel risk thresholds
              </span>
            </div>
          </Link>

          <Link
            href="/admin/economics-analytics"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-indigo-100 group-hover:text-indigo-800 transition-colors">
              <LineChart className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-indigo-900 transition-colors">
                Macro Economics
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                State cost benchmarks
              </span>
            </div>
          </Link>

          <Link
            href="/admin/analytics"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
              <Activity className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-amber-900 transition-colors">
                System Telemetry
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                DAU/WAU & funnels
              </span>
            </div>
          </Link>

          <Link
            href="/admin/ai-review"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-amber-100 group-hover:text-amber-800 transition-colors">
              <MessageSquareWarning className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-amber-900 transition-colors">
                AI Safety Reviews
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {stats.pendingAiReviewsCount} pending
              </span>
            </div>
          </Link>

          <Link
            href="/admin/alerts"
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-stone-400 transition-all shadow-2xs group flex flex-col justify-between"
          >
            <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-red-100 group-hover:text-red-800 transition-colors">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="mt-3">
              <span className="text-xs font-bold text-pankh-clay block group-hover:text-red-900 transition-colors">
                Sentinel Alerts
              </span>
              <span className="text-[10px] text-stone-500 font-mono">
                {stats.redAlertsCount} urgent RED
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
