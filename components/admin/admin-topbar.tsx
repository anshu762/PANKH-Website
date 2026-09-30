"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { ShieldCheck, Clock } from "lucide-react";

interface AdminTopbarProps {
  userEmail?: string;
  userRole?: string;
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Operations Overview",
    subtitle: "Real-time Punjab poultry surveillance, active alerts, and platform health",
  },
  "/admin/farmers": {
    title: "Farmers & Farms Directory",
    subtitle: "Search, filter, and inspect registered farmers, shed capacities, and consent states",
  },
  "/admin/alerts": {
    title: "High-Risk Alert Surveillance Queue",
    subtitle: "Active RED & AMBER alerts sorted by elapsed time with case escalation tracking",
  },
  "/admin/vetlab": {
    title: "Veterinarian & Diagnostic Lab Directory",
    subtitle: "Directory CRUD, road geocoding, service radius, and specialist verification",
  },
  "/admin/knowledge": {
    title: "RAG Knowledge Base & pgvector Indexer",
    subtitle: "Source curation, chunk tagging, approved status enforcement, and vector re-indexing",
  },
  "/admin/rules": {
    title: "Sentinel Risk Engine Alert Rules",
    subtitle: "Configurable mortality, intake, and temp thresholds with immutable audit logs",
  },
  "/admin/ai-review": {
    title: "AI Response Review & Feedback Queue",
    subtitle: "Inspect assistant messages with farmer feedback, source traces, and safety audits",
  },
  "/admin/economics-analytics": {
    title: "Macro Farm Economics Analytics",
    subtitle: "Anonymized, aggregated flock cost benchmarks across Punjab (Zero Farmer PII)",
  },
  "/admin/analytics": {
    title: "System Analytics & Telemetry",
    subtitle: "DAU/WAU tracking, daily check-in completion rates, and platform conversion funnels",
  },
};

export function AdminTopbar({ userEmail, userRole }: AdminTopbarProps) {
  const pathname = usePathname();
  const current = SECTION_TITLES[pathname] || {
    title: "Admin Console",
    subtitle: "Pankh administrative operations desk",
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="h-16 bg-white border-b border-stone-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 className="font-serif text-lg font-bold text-pankh-clay">
          {current.title}
        </h2>
        <p className="text-[11px] text-stone-500 hidden sm:block">
          {current.subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200">
          <Clock className="h-3.5 w-3.5 text-stone-400" />
          <span>{todayStr} (IST)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-semibold">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
          <span className="hidden sm:inline">Audit Log Active</span>
        </div>
      </div>
    </header>
  );
}
