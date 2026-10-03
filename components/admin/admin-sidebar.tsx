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
  ShieldAlert,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

interface AdminSidebarProps {
  userRole?: string;
  userEmail?: string;
  userName?: string;
  className?: string;
  isMobileDrawer?: boolean;
  onNavigate?: () => void;
}

interface NavGroup {
  groupTitle: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    exact?: boolean;
    badge?: string;
    badgeVariant?: "red" | "amber" | "default";
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: "Core Operations",
    items: [
      {
        href: "/admin",
        label: "Overview",
        icon: LayoutDashboard,
        exact: true,
      },
      {
        href: "/admin/alerts",
        label: "High-Risk Alerts",
        icon: AlertTriangle,
        badge: "LIVE",
        badgeVariant: "red",
      },
      {
        href: "/admin/ai-review",
        label: "AI Safety Review",
        icon: MessageSquareWarning,
        badge: "QUEUE",
        badgeVariant: "amber",
      },
    ],
  },
  {
    groupTitle: "Registry & Network",
    items: [
      {
        href: "/admin/farmers",
        label: "Farmers & Farms",
        icon: Users,
      },
      {
        href: "/admin/vetlab",
        label: "Vet & Lab Directory",
        icon: Stethoscope,
      },
      {
        href: "/admin/knowledge",
        label: "Knowledge Base",
        icon: BookOpen,
      },
    ],
  },
  {
    groupTitle: "Governance & Telemetry",
    items: [
      {
        href: "/admin/rules",
        label: "Alert Rules & Audit",
        icon: Sliders,
      },
      {
        href: "/admin/economics-analytics",
        label: "Macro Economics",
        icon: LineChart,
      },
      {
        href: "/admin/analytics",
        label: "System Telemetry",
        icon: Activity,
      },
    ],
  },
];

export function AdminSidebar({
  userRole = "ADMIN",
  userEmail = "admin@pankh.app",
  userName = "Operations Admin",
  className,
  isMobileDrawer = false,
  onNavigate,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const sidebarClasses = isMobileDrawer
    ? "flex flex-col h-full bg-[#FAF9F5] justify-between"
    : cn(
        "fixed inset-y-0 left-0 z-30 w-64 bg-[#FAF9F5] border-r border-stone-200/90 flex flex-col justify-between shadow-xs select-none",
        className
      );

  return (
    <aside className={sidebarClasses}>
      {/* Top Section: Brand + Navigation */}
      <div className="flex-1 overflow-y-auto">
        {/* Brand Header */}
        {!isMobileDrawer && (
          <div className="p-5 border-b border-stone-200/80 bg-white/50">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold font-serif text-lg shadow-2xs group-hover:bg-amber-500/25 transition-all">
                P
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-serif font-bold text-lg text-pankh-clay tracking-tight leading-tight">
                    Pankh
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-900 font-bold border border-amber-300 tracking-wider">
                    ADMIN
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 font-mono">
                  Punjab Operations Desk
                </p>
              </div>
            </Link>
          </div>
        )}

        {/* Navigation Groups */}
        <div className="p-3 space-y-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupTitle} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-stone-600 font-bold">
                {group.groupTitle}
              </div>

              {group.items.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group cursor-pointer",
                      isActive
                        ? "bg-amber-500/15 text-amber-950 font-bold border border-amber-400/40 shadow-2xs"
                        : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          isActive
                            ? "text-amber-700"
                            : "text-stone-600 group-hover:text-stone-700"
                        )}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold uppercase tracking-tight",
                          item.badgeVariant === "red"
                            ? "bg-red-100 text-red-700 border border-red-200 animate-pulse"
                            : item.badgeVariant === "amber"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-stone-200 text-stone-700"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section: Farmer App Switcher & User Account */}
      <div className="p-3 border-t border-stone-200/80 bg-white/40 space-y-2.5 shrink-0">
        {/* Switch to Public Site */}
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200/70 text-stone-700 hover:text-stone-900 text-xs font-semibold border border-stone-200/80 transition-all shadow-2xs group"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>View Public Site</span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </Link>

        {/* User Card & Sign Out */}
        <div className="px-3 py-2 rounded-xl bg-[#FAF9F5] border border-stone-200/90 flex items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-amber-600/10 border border-amber-600/20 text-amber-800 font-bold font-serif text-xs flex items-center justify-center shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-pankh-clay truncate leading-tight">
                {userName}
              </p>
              <p className="text-[10px] text-stone-400 font-mono truncate leading-none mt-0.5">
                {userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Sign Out"
            className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
