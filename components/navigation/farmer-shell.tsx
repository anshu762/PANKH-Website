"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { FarmerSidebar } from "./farmer-sidebar";
import { FarmerMobileHeader } from "./farmer-mobile-header";
import { FarmerMobileBottomNav } from "./farmer-mobile-bottom-nav";
import { OfflineBanner } from "@/components/common/offline-banner";
import type { Session } from "next-auth";

interface FarmerShellProps {
  children: React.ReactNode;
  session: Session | null;
}

export function FarmerShell({ children, session }: FarmerShellProps) {
  const pathname = usePathname();

  // On onboarding screens, don't render dashboard navigation chrome
  const isOnboarding = pathname.startsWith("/onboarding");
  if (isOnboarding) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col md:flex-row selection:bg-pankh-marigold selection:text-white">
      {/* Desktop Persistent Sidebar */}
      <FarmerSidebar session={session} />

      {/* Mobile Sticky Header */}
      <FarmerMobileHeader />

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen pb-20 md:pb-8">
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <FarmerMobileBottomNav />

      {/* Global Offline Network Status Alert */}
      <OfflineBanner />
    </div>
  );
}
