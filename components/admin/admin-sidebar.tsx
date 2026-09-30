"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  Stethoscope,
  BookOpen,
  Sliders,
  MessageSquareWarning,
  LineChart,
  Activity,
  ArrowUpRight,
  LogOut,
  Shield,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  userRole?: string;
  userEmail?: string;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/admin/farmers",
    label: "Farmers & Farms",
    icon: Users,
  },
  {
    href: "/admin/alerts",
    label: "High-Risk Alerts",
    icon: AlertTriangle,
    badgeColor: "bg-red-500 text-white",
  },
  {
    href: "/admin/vetlab",
    label: "Vet / Lab Directory",
    icon: Stethoscope,
  },
  {
    href: "/admin/knowledge",
    label: "Knowledge Base",
    icon: BookOpen,
  },
  {
    href: "/admin/rules",
    label: "Alert Rules & Audit",
    icon: Sliders,
  },
  {
    href: "/admin/ai-review",
    label: "AI Review Queue",
    icon: MessageSquareWarning,
  },
  {
    href: "/admin/economics-analytics",
    label: "Economics Analytics",
    icon: LineChart,
  },
  {
    href: "/admin/analytics",
    label: "System Analytics",
    icon: Activity,
  },
];

export function AdminSidebar({ userRole, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-screen">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-serif">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base text-white tracking-tight">
                  Pankh
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Operations & Surveillance
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold">
            Administrative Modules
          </div>

          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-slate-800 text-white font-bold shadow-xs border border-slate-700"
                    : "text-slate-400 hover:text-white hover:bg-slate-900/80"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-colors",
                      isActive
                        ? "text-amber-400"
                        : "text-slate-400 group-hover:text-slate-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Actions */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <Link
          href="/dashboard"
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
            <span>Farmer App</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-500" />
        </Link>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-white block truncate">
                {userEmail || "Admin"}
              </span>
              <span className="text-[9px] font-mono text-slate-400 block uppercase">
                {userRole || "ADMIN"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-300 text-[11px] font-semibold transition-colors cursor-pointer border border-slate-700/60"
          >
            <LogOut className="h-3 w-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
