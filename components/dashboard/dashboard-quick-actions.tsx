"use client";

import React from "react";
import Link from "next/link";
import { MessageSquare, ShieldAlert, Stethoscope, IndianRupee, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function DashboardQuickActions() {
  const { t } = useLanguage();
  const d = t.dashboardHome;

  const actions = [
    {
      href: "/dashboard/ask",
      label: d.askCard.title,
      sublabel: "Voice & text poultry query",
      badge: "AI 6-Step",
      icon: MessageSquare,
      accentBorder: "border-amber-300 hover:border-amber-400",
      accentBg: "from-amber-500/10 via-amber-50/50 to-white",
      iconBg: "bg-amber-500/15 text-amber-800 border-amber-300",
      tagColor: "bg-amber-100 text-amber-900",
    },
    {
      href: "/dashboard/sentinel",
      label: d.sentinelCard.title,
      sublabel: "30-second daily check-in",
      badge: "Sentinel Radar",
      icon: ShieldAlert,
      accentBorder: "border-emerald-300 hover:border-emerald-400",
      accentBg: "from-emerald-500/10 via-emerald-50/50 to-white",
      iconBg: "bg-emerald-500/15 text-emerald-800 border-emerald-300",
      tagColor: "bg-emerald-100 text-emerald-900",
    },
    {
      href: "/dashboard/connect",
      label: d.connectCard.title,
      sublabel: "Ludhiana GADVASU & local clinics",
      badge: "Connect Vets",
      icon: Stethoscope,
      accentBorder: "border-orange-300 hover:border-orange-400",
      accentBg: "from-orange-500/10 via-orange-50/50 to-white",
      iconBg: "bg-orange-500/15 text-orange-800 border-orange-300",
      tagColor: "bg-orange-100 text-orange-900",
    },
    {
      href: "/dashboard/economics",
      label: d.economicsCard.title,
      sublabel: "Feed bags & medicine transactions",
      badge: "Flock Ledger",
      icon: IndianRupee,
      accentBorder: "border-indigo-300 hover:border-indigo-400",
      accentBg: "from-indigo-500/10 via-indigo-50/50 to-white",
      iconBg: "bg-indigo-500/15 text-indigo-800 border-indigo-300",
      tagColor: "bg-indigo-100 text-indigo-900",
    },
  ];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-pankh-clay">
          Quick Farm Actions
        </h2>
        <span className="text-xs text-stone-500 font-sans">
          Fast shortcuts for daily shed operations
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act, idx) => {
          const Icon = act.icon;

          return (
            <Link
              key={idx}
              href={act.href}
              className={`group relative rounded-2xl border ${act.accentBorder} bg-gradient-to-br ${act.accentBg} p-4 sm:p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between min-h-[130px]`}
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 ${act.iconBg}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex items-center gap-1">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${act.tagColor}`}
                  >
                    {act.badge}
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>

              <div className="pt-3">
                <span className="font-serif font-bold text-sm sm:text-base text-pankh-clay block group-hover:text-stone-950 transition-colors leading-tight">
                  {act.label}
                </span>
                <span className="text-[11px] text-stone-500 block truncate mt-0.5">
                  {act.sublabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
