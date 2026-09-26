"use client";

import React from "react";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarFlockBadge } from "./sidebar-flock-badge";
import { SidebarNavGroups } from "./sidebar-nav-groups";
import { SidebarEmergencyCard } from "./sidebar-emergency-card";
import { SidebarUserFooter } from "./sidebar-user-footer";
import type { Session } from "next-auth";

interface FarmerSidebarProps {
  session: Session | null;
}

export function FarmerSidebar({ session }: FarmerSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#FAF9F5] border-r border-stone-200/90 fixed inset-y-0 left-0 z-30 shadow-xs justify-between">
      <div>
        {/* 1. Brand Logo & Seal Header */}
        <SidebarBrand />

        {/* 2. Active Flock Context Pill */}
        <SidebarFlockBadge />
      </div>

      {/* 3. Grouped Navigation Links */}
      <SidebarNavGroups />

      <div>
        {/* 4. Vet Emergency Help Callout */}
        <SidebarEmergencyCard />

        {/* 5. User Account & Language Grid Footer */}
        <SidebarUserFooter session={session} />
      </div>
    </aside>
  );
}
