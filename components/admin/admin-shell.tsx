"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./admin-sidebar";
import { AdminTopbar } from "./admin-topbar";
import { Menu, X, ShieldAlert, ArrowLeft } from "lucide-react";
import type { Session } from "next-auth";

interface AdminShellProps {
  children: React.ReactNode;
  session: Session | null;
}

export function AdminShell({ children, session }: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const userRole = session?.user?.role || "ADMIN";
  const userEmail = session?.user?.email || "admin@pankh.app";
  const userName = session?.user?.name || "Operations Admin";

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row text-stone-900 selection:bg-amber-500 selection:text-white antialiased">
      {/* 1. Desktop Persistent Fixed Sidebar */}
      <AdminSidebar
        userRole={userRole}
        userEmail={userEmail}
        userName={userName}
        className="hidden md:flex"
      />

      {/* 2. Mobile Sticky Header with Hamburger Toggle */}
      <header className="sticky top-0 z-30 flex md:hidden items-center justify-between px-4 py-3 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold font-serif text-base shadow-2xs">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif font-bold text-base text-pankh-clay tracking-tight">
                  Pankh
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-stone-500 font-mono leading-none">
                Surveillance Desk
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-1 text-[11px] font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200"
          >
            <ArrowLeft className="h-3 w-3" />
            <span>Public Site</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-9 w-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {/* 3. Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Sidebar */}
          <div className="relative w-72 max-w-[85vw] bg-[#FAF9F5] h-full shadow-2xl z-50 flex flex-col justify-between animate-in slide-in-from-left duration-200">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800 font-bold font-serif text-base">
                  P
                </div>
                <div>
                  <span className="font-serif font-bold text-sm text-pankh-clay">
                    Pankh Admin
                  </span>
                  <span className="text-[10px] block text-stone-500 font-mono">
                    Navigation Menu
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <AdminSidebar
                userRole={userRole}
                userEmail={userEmail}
                userName={userName}
                isMobileDrawer={true}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Scroll Container */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">
        <AdminTopbar
          userRole={userRole}
          userEmail={userEmail}
          userName={userName}
        />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
