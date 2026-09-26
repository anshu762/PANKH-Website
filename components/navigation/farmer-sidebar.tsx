"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import { LanguageSelector } from "@/components/common/language-selector";
import { signOut } from "next-auth/react";
import {
  Home,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  IndianRupee,
  User,
  LogOut,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface FarmerSidebarProps {
  session: Session | null;
}

export function FarmerSidebar({ session }: FarmerSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const nav = t.farmerNav;

  const navItems = [
    {
      href: "/dashboard",
      label: nav.home,
      icon: Home,
      exact: true,
    },
    {
      href: "/dashboard/ask",
      label: nav.ask,
      icon: MessageSquare,
      exact: false,
      badge: "AI 6-Step",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
    },
    {
      href: "/dashboard/sentinel",
      label: nav.checkin,
      icon: ShieldAlert,
      exact: false,
      badge: "Radar",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
    },
    {
      href: "/dashboard/connect",
      label: nav.connect,
      icon: Stethoscope,
      exact: false,
    },
    {
      href: "/dashboard/economics",
      label: nav.money,
      icon: IndianRupee,
      exact: false,
    },
    {
      href: "/dashboard/profile",
      label: nav.profile,
      icon: User,
      exact: false,
    },
  ];

  const checkIsActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#FAF9F5] border-r border-stone-200/90 fixed inset-y-0 left-0 z-30 shadow-xs">
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-5 border-b border-stone-200/70">
        <Link href="/dashboard" className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm border border-amber-600/30">
            ਪੰ
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-pankh-clay leading-tight">
              {t.common.platformName}
            </span>
            <span className="text-[10px] text-amber-950/70 font-mono font-medium leading-none">
              Punjab Poultry Intel
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = checkIsActive(item.href, item.exact);
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[46px] group",
                isActive
                  ? "bg-amber-100/80 text-pankh-clay font-bold shadow-xs border border-amber-300/80 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-r-full before:bg-pankh-marigold"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-100/80"
              )}
            >
              <div className="flex items-center gap-3">
                <IconComponent
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive
                      ? "text-pankh-marigold"
                      : "text-stone-500 group-hover:text-stone-900"
                  )}
                />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border",
                    item.badgeColor
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Sidebar Footer: Language & Account */}
      <div className="p-4 border-t border-stone-200/80 space-y-3 bg-white/60">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-mono">
            {t.auth.languageLabel}
          </span>
          <LanguageSelector variant="pill" />
        </div>

        <div className="pt-2.5 border-t border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="h-8 w-8 rounded-full bg-amber-500/15 border border-amber-400 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
              {(session?.user?.name || "F")[0].toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-pankh-clay truncate leading-tight">
                {session?.user?.name || "Farmer"}
              </span>
              <span className="text-[10px] text-stone-500 truncate font-mono">
                {session?.user?.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-1.5 rounded-lg text-stone-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title={t.profile.logout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
