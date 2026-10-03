"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, Clock, ArrowUpRight, Activity } from "lucide-react";

interface AdminTopbarProps {
  userEmail?: string;
  userRole?: string;
  userName?: string;
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string; category: string }> = {
  "/admin": {
    category: "Core Operations",
    title: "Surveillance & Operations Command",
    subtitle: "Real-time Punjab poultry surveillance, active flock alerts, and platform health",
  },
  "/admin/farmers": {
    category: "Registry & Network",
    title: "Farmers & Commercial Sheds Directory",
    subtitle: "Search, filter, and inspect registered farmers, bird capacities, and consent states",
  },
  "/admin/alerts": {
    category: "Core Operations",
    title: "High-Risk Sentinel Alerts Queue",
    subtitle: "Active RED & AMBER alerts sorted by elapsed time with case escalation tracking",
  },
  "/admin/vetlab": {
    category: "Registry & Network",
    title: "Veterinarians & Diagnostic Labs",
    subtitle: "Verified specialist directory, geocoded service radii, and laboratory accreditation",
  },
  "/admin/knowledge": {
    category: "Registry & Network",
    title: "RAG Knowledge Base & pgvector Index",
    subtitle: "Curated GADVASU/ICAR literature, chunk inspection, and approved status enforcement",
  },
  "/admin/rules": {
    category: "Governance & Telemetry",
    title: "Sentinel Alert Rules & Immutable Audit",
    subtitle: "Configurable mortality, feed intake, and temperature thresholds with change logs",
  },
  "/admin/ai-review": {
    category: "Core Operations",
    title: "AI Grounding & Safety Review Queue",
    subtitle: "Inspect assistant messages with farmer feedback, source citations, and safety audits",
  },
  "/admin/economics-analytics": {
    category: "Governance & Telemetry",
    title: "Regional Economics Macro Benchmarks",
    subtitle: "Anonymized, aggregated flock cost benchmarks across Punjab (Zero Farmer PII)",
  },
  "/admin/analytics": {
    category: "Governance & Telemetry",
    title: "System Telemetry & Platform Analytics",
    subtitle: "DAU/WAU tracking, daily check-in habits, early alert trigger frequency, and field data",
  },
};

export function AdminTopbar({ userEmail, userRole = "ADMIN", userName }: AdminTopbarProps) {
  const pathname = usePathname();
  const current = SECTION_TITLES[pathname] || {
    category: "Console",
    title: "Operations Command Desk",
    subtitle: "Pankh administrative operations and state surveillance",
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="sticky top-0 z-20 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
      {/* Page Title & Breadcrumb */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold mb-0.5">
          <span>Pankh Admin</span>
          <span>/</span>
          <span className="text-amber-800">{current.category}</span>
        </div>
        <h1 className="font-serif text-lg sm:text-xl font-bold text-pankh-clay tracking-tight truncate leading-tight">
          {current.title}
        </h1>
        <p className="text-[11px] text-stone-500 hidden md:block truncate mt-0.5">
          {current.subtitle}
        </p>
      </div>

      {/* Topbar Utility Actions & Indicators */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
        {/* Live Network Status Indicator */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200/90 text-xs font-semibold shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="text-[11px] font-mono">Punjab Sentinel Live</span>
        </div>

        {/* Live IST Clock */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-stone-600 bg-white/80 px-2.5 py-1 rounded-lg border border-stone-200/90 shadow-2xs">
          <Clock className="h-3.5 w-3.5 text-stone-600" />
          <span>{todayStr} (IST)</span>
        </div>

        {/* Audit Mode Active Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold shadow-2xs">
          <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
          <span className="font-mono text-[10px] uppercase font-bold tracking-tight">
            {userRole}
          </span>
        </div>

        {/* Quick Link to Public Site */}
        <Link
          href="/"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 bg-amber-500/15 hover:bg-amber-500/25 px-3 py-1.5 rounded-lg border border-amber-400/40 shadow-2xs transition-all group"
        >
          <span>Public Site</span>
          <ArrowUpRight className="h-3.5 w-3.5 text-amber-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </header>
  );
}
