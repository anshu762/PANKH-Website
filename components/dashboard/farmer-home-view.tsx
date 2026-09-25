"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import {
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Stethoscope,
  IndianRupee,
  Mic,
  ArrowRight,
  Warehouse,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

interface FarmerHomeViewProps {
  farmer: any;
  farm: any;
  batch: any;
  todayLog: any;
  latestAlert: any;
  economics: {
    totalSpend: number;
    totalRevenue: number;
    netMargin: number;
  };
}

export function FarmerHomeView({
  farmer,
  farm,
  batch,
  todayLog,
  latestAlert,
  economics,
}: FarmerHomeViewProps) {
  const { t, lang } = useLanguage();
  const d = t.dashboardHome;

  // Calculate batch day
  let flockDay = 1;
  if (batch?.placementDate) {
    const placed = new Date(batch.placementDate);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - placed.getTime()) / (1000 * 60 * 60 * 24)
    );
    flockDay = Math.max(1, diffDays + 1);
  }

  // Sentinel status color resolution
  const alertSeverity = latestAlert?.severity || "GREEN";
  const isCheckedInToday = Boolean(todayLog);

  return (
    <div key={lang} className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* Top Banner: Greeting & Active Flock Overview             */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              {farm?.name || "Pankh Farm"} • {farmer?.village || "Punjab"}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay">
              {d.greeting},{" "}
              <span className="text-primary font-normal">
                {farmer?.user?.name || "Farmer"}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-600">
              {farmer?.district}, {farmer?.state || "Punjab"}
            </p>
          </div>

          {/* Active Flock Pill Card */}
          {batch ? (
            <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-3.5 sm:p-4 flex items-center gap-4 shrink-0">
              <div className="h-11 w-11 rounded-lg bg-amber-100/80 flex items-center justify-center shrink-0">
                <Warehouse className="h-5 w-5 text-amber-800" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-pankh-clay">
                    {d.shed} 1 • {batch.breed} {batch.productionType === "BROILER" ? "Broiler" : "Layer"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    {d.day} {flockDay}
                  </span>
                </div>
                <div className="text-xs text-stone-600 flex items-center gap-3">
                  <span>
                    <strong>{batch.currentBirds?.toLocaleString() || batch.startingBirds?.toLocaleString()}</strong> {d.birds}
                  </span>
                  <span>•</span>
                  <span>Cap: {farm?.capacity?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>{d.noActiveBatch}</span>
              <Link
                href="/onboarding/farm"
                className="underline font-bold text-primary"
              >
                Setup Batch
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4 Distinct Module Tiles (DESIGN.md Tokens)               */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* ------------------------------------------------------ */}
        {/* Tile 1: Ask Pankh AI (Sarson Marigold Glow)            */}
        {/* ------------------------------------------------------ */}
        <div className="rounded-2xl border-2 border-amber-400/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-6 sm:p-7 shadow-xs flex flex-col justify-between relative overflow-hidden group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/70 text-amber-950 font-bold text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                {d.askCard.badge}
              </span>
              <span className="text-xs font-mono text-stone-500">Phase 3 Ready</span>
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
                {d.askCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                {d.askCard.subtitle}
              </p>
            </div>

            {/* Quick Prompt Helper Chips */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 block">
                {d.askCard.voicePrompt}
              </span>
              <div className="space-y-1.5">
                {[d.askCard.prompt1, d.askCard.prompt2, d.askCard.prompt3].map(
                  (prompt, idx) => (
                    <Link
                      key={idx}
                      href="/dashboard/ask"
                      className="block px-3 py-2 rounded-lg bg-white/90 border border-amber-200/80 text-xs text-stone-700 hover:text-amber-900 hover:border-amber-400 transition-colors shadow-2xs font-medium"
                    >
                      "{prompt}"
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-amber-200/60">
            <Link
              href="/dashboard/ask"
              className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-marigold hover:bg-amber-600 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                <span>{d.askCard.cta}</span>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Tile 2: Today's Flock Check / Sentinel (Tri-Status)    */}
        {/* ------------------------------------------------------ */}
        <div
          className={`rounded-2xl border-2 p-6 sm:p-7 shadow-xs flex flex-col justify-between ${
            alertSeverity === "RED"
              ? "border-red-400 bg-red-50/40"
              : alertSeverity === "AMBER"
              ? "border-amber-400 bg-amber-50/40"
              : "border-emerald-400 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/20"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                {d.sentinelCard.badge}
              </span>

              {/* Status Badge */}
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                  alertSeverity === "RED"
                    ? "bg-red-200 text-red-900"
                    : alertSeverity === "AMBER"
                    ? "bg-amber-200 text-amber-900"
                    : "bg-emerald-200/70 text-emerald-950 font-mono"
                }`}
              >
                {alertSeverity === "RED"
                  ? d.sentinelCard.statusUrgent
                  : alertSeverity === "AMBER"
                  ? d.sentinelCard.statusWatch
                  : d.sentinelCard.statusNormal}
              </span>
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
                {d.sentinelCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                {d.sentinelCard.subtitle}
              </p>
            </div>

            {/* Daily Check-in Status Card */}
            <div className="p-4 rounded-xl border border-stone-200 bg-white/95 space-y-2">
              <div className="flex items-center gap-2.5">
                {isCheckedInToday ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                ) : (
                  <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                )}
                <div>
                  <span className="text-xs font-bold text-pankh-clay block">
                    {isCheckedInToday
                      ? d.sentinelCard.checkedToday
                      : d.sentinelCard.notCheckedToday}
                  </span>
                  <span className="text-[11px] text-stone-500 block">
                    {isCheckedInToday
                      ? `Mortality: ${todayLog?.mortality || 0} • Feed: ${todayLog?.feedKg || 0}kg`
                      : "Log feed, water, and mortality in 30 seconds"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-stone-200">
            <Link
              href="/dashboard/sentinel"
              className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-clay hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>{d.sentinelCard.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Tile 3: Expert & Vet Help (Phulkari Vermilion Accent) */}
        {/* ------------------------------------------------------ */}
        <div className="rounded-2xl border-2 border-orange-300 bg-gradient-to-br from-orange-50/60 via-white to-stone-50/50 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-950 font-bold text-xs">
                <Stethoscope className="h-3.5 w-3.5 text-orange-700" />
                {d.connectCard.badge}
              </span>
              <span className="text-xs font-mono text-stone-500">Punjab Network</span>
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
                {d.connectCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                {d.connectCard.subtitle}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/95 border border-orange-200/80 space-y-1">
              <span className="text-xs font-semibold text-pankh-clay block">
                {d.connectCard.vetsAvailable}
              </span>
              <span className="text-[11px] text-stone-500 block">
                Direct WhatsApp, phone consultation, and lab testing
              </span>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-orange-200/60">
            <Link
              href="/dashboard/connect"
              className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-phulkari hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>{d.connectCard.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* ------------------------------------------------------ */}
        {/* Tile 4: Batch Money (Night Indigo Ledger Accent)       */}
        {/* ------------------------------------------------------ */}
        <div className="rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-950 font-bold text-xs">
                <TrendingUp className="h-3.5 w-3.5 text-indigo-700" />
                {d.economicsCard.badge}
              </span>
              <span className="text-xs font-mono text-stone-500">Flock Ledger</span>
            </div>

            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-pankh-clay">
                {d.economicsCard.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                {d.economicsCard.subtitle}
              </p>
            </div>

            {/* Financial Ledger Snapshot */}
            <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-white/95 border border-indigo-100 text-center">
              <div>
                <span className="text-[10px] text-stone-500 block font-sans">
                  {d.economicsCard.spendLabel}
                </span>
                <span className="text-xs sm:text-sm font-bold text-pankh-clay">
                  ₹{economics.totalSpend.toLocaleString()}
                </span>
              </div>
              <div className="border-x border-stone-200">
                <span className="text-[10px] text-stone-500 block font-sans">
                  {d.economicsCard.revenueLabel}
                </span>
                <span className="text-xs sm:text-sm font-bold text-emerald-700">
                  ₹{economics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block font-sans">
                  {d.economicsCard.marginLabel}
                </span>
                <span className="text-xs sm:text-sm font-bold text-indigo-900">
                  ₹{economics.netMargin.toLocaleString()}
                </span>
              </div>
            </div>

            {economics.totalSpend === 0 && (
              <p className="text-[11px] text-stone-500 italic">
                {d.economicsCard.emptyState}
              </p>
            )}
          </div>

          <div className="pt-5 mt-4 border-t border-indigo-100">
            <Link
              href="/dashboard/economics"
              className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors"
            >
              <span>{d.economicsCard.cta}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
