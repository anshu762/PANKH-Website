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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Farmers */}
        <Link
          href="/admin/farmers"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-indigo-400 shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
              Registered Farmers
            </span>
            <Users className="h-4 w-4 text-stone-400 group-hover:text-indigo-600 transition-colors" />
          </div>
          <div className="text-2xl font-bold font-mono text-pankh-clay mt-2">
            {stats.totalFarmers}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            {stats.activeBatches} active flock batches
          </p>
        </Link>

        {/* High-Risk Alerts */}
        <Link
          href="/admin/alerts"
          className={cn(
            "p-4 rounded-2xl border shadow-2xs hover:shadow-xs transition-all group",
            stats.redAlertsCount > 0
              ? "bg-red-50/50 border-red-200 hover:border-red-400"
              : "bg-white border-stone-200 hover:border-stone-400"
          )}
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-sans text-red-900">
              Active RED Alerts
            </span>
            <AlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-red-700 mt-2">
            {stats.redAlertsCount}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            {stats.openCasesCount} medical cases open
          </p>
        </Link>

        {/* AI Feedback Reviews */}
        <Link
          href="/admin/ai-review"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
              AI Review Queue
            </span>
            <MessageSquareWarning className="h-4 w-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-700 mt-2">
            {stats.pendingAiReviewsCount}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Negative farmer feedback
          </p>
        </Link>

        {/* Vet Directory */}
        <Link
          href="/admin/vetlab"
          className="p-4 rounded-2xl bg-white border border-stone-200 hover:border-emerald-400 shadow-2xs hover:shadow-xs transition-all group"
        >
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-sans">
              Verified Specialists
            </span>
            <Stethoscope className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-2">
            {stats.verifiedVetCount}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            {stats.approvedKbSourcesCount} approved KB sources
          </p>
        </Link>
      </div>

      {/* 2. Priority Active Queues Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {/* High-Risk Alerts Surveillance Queue */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-red-100 flex items-center justify-center text-red-700">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                High-Risk Alerts Awaiting Resolution
              </h3>
            </div>
            <Link
              href="/admin/alerts"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              <span>View Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAlerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pankh-clay">
                      {alert.farmName}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">
                      ({alert.district})
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-bold">
                      RED
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 line-clamp-1">
                    {alert.reason}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-stone-500 font-mono">
                    <span>Farmer: {alert.farmerName} ({alert.farmerPhone})</span>
                    <span>•</span>
                    <span>{alert.hoursAgo}h ago</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {alert.linkedCase ? (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      {alert.linkedCase.status}
                    </span>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 text-stone-700">
                      Unescalated
                    </span>
                  )}
                </div>
              </div>
            ))}

            {recentAlerts.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <span>Zero active high-risk alerts in queue</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Feedback & Review Queue */}
        <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <MessageSquareWarning className="h-4 w-4" />
              </div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Negative AI Feedback Queue
              </h3>
            </div>
            <Link
              href="/admin/ai-review"
              className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1"
            >
              <span>Audit Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAiFeedback.slice(0, 4).map((msg) => (
              <div
                key={msg.id}
                className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-pankh-clay">
                    {msg.farmerName}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-300">
                    Feedback: {msg.feedback}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 line-clamp-2">
                  "{msg.content}"
                </p>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                  <span>Sources: {msg.sourceTitles.length} cited</span>
                  <span>•</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}

            {recentAiFeedback.length === 0 && (
              <div className="py-8 text-center text-xs text-stone-400 flex flex-col items-center justify-center gap-1">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <span>Zero pending negative AI feedback messages</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Desk Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          href="/admin/rules"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" />
            <span>Sentinel Rules & Audit</span>
          </div>
          <ArrowRight className="h-3 w-3 text-stone-400" />
        </Link>

        <Link
          href="/admin/knowledge"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-600" />
            <span>Knowledge Base</span>
          </div>
          <ArrowRight className="h-3 w-3 text-stone-400" />
        </Link>

        <Link
          href="/admin/economics-analytics"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-purple-600" />
            <span>Macro Economics</span>
          </div>
          <ArrowRight className="h-3 w-3 text-stone-400" />
        </Link>

        <Link
          href="/admin/analytics"
          className="p-3.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-50 text-xs font-semibold text-stone-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            <span>System Telemetry</span>
          </div>
          <ArrowRight className="h-3 w-3 text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
