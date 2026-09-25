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
  Warehouse,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Session } from "next-auth";

interface FarmerShellProps {
  children: React.ReactNode;
  session: Session | null;
}

export function FarmerShell({ children, session }: FarmerShellProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const nav = t.farmerNav;

  // On onboarding screens, don't render dashboard navigation chrome
  const isOnboarding = pathname.startsWith("/onboarding");
  if (isOnboarding) {
    return <>{children}</>;
  }

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
    },
    {
      href: "/dashboard/sentinel",
      label: nav.checkin,
      icon: ShieldAlert,
      exact: false,
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
    <div className="min-h-screen bg-pankh-paper flex flex-col md:flex-row selection:bg-pankh-marigold selection:text-white">
      {/* ======================================================== */}
      {/* Desktop Sidebar (md:flex)                                */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 bg-card border-r border-border/80 fixed inset-y-0 left-0 z-30 shadow-xs">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/60">
          <Link href="/dashboard" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-pankh-clay flex items-center justify-center text-white font-serif font-bold text-lg shadow-xs">
              ਪੰ
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-pankh-clay leading-tight">
                {t.common.platformName}
              </span>
              <span className="text-[10px] text-stone-500 font-sans leading-none">
                {t.farmer.portalTitle}
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
                  "flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px]",
                  isActive
                    ? "bg-amber-100/70 text-pankh-clay font-bold shadow-xs border border-amber-300/60"
                    : "text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                )}
              >
                <IconComponent
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-stone-500"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Sidebar Footer: Language & Account */}
        <div className="p-4 border-t border-border/60 space-y-3 bg-stone-50/50">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              {t.auth.languageLabel}
            </span>
            <LanguageSelector variant="pill" />
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
            <div className="flex flex-col min-w-0 pr-2">
              <span className="text-xs font-bold text-pankh-clay truncate">
                {session?.user?.name || "Farmer"}
              </span>
              <span className="text-[10px] text-stone-500 truncate">
                {session?.user?.email}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-stone-500 hover:text-destructive hover:bg-destructive/10 transition-colors"
              title={t.profile.logout}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* Mobile Sticky Header (md:hidden)                         */}
      {/* ======================================================== */}
      <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border/80 h-14 px-4 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-7 w-7 rounded-lg bg-pankh-clay flex items-center justify-center text-white font-serif font-bold text-sm shadow-xs">
            ਪੰ
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-pankh-clay">
            {t.common.platformName}
          </span>
        </Link>
        <LanguageSelector variant="pill" />
      </header>

      {/* ======================================================== */}
      {/* Main Content Area                                        */}
      {/* ======================================================== */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-6">
        <div className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </div>

      {/* ======================================================== */}
      {/* Mobile Persistent Bottom Nav (md:hidden)                 */}
      {/* ======================================================== */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border/80 pb-[max(env(safe-area-inset-bottom),0.35rem)] shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="grid grid-cols-6 h-16">
          {navItems.map((item) => {
            const isActive = checkIsActive(item.href, item.exact);
            const IconComponent = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center py-1 transition-colors relative min-h-[48px]",
                  isActive
                    ? "text-primary font-bold"
                    : "text-stone-500 hover:text-stone-900"
                )}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full" />
                )}
                <IconComponent
                  className={cn(
                    "h-5 w-5 mb-0.5",
                    isActive ? "text-primary" : "text-stone-500"
                  )}
                />
                <span className="text-[10px] tracking-tight leading-none text-center">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
