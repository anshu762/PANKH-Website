"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import type { Session } from "next-auth";

interface SidebarUserFooterProps {
  session: Session | null;
}

export function SidebarUserFooter({ session }: SidebarUserFooterProps) {
  const { t } = useLanguage();

  const name = session?.user?.name || "Farmer";
  const initial = name[0]?.toUpperCase() || "F";
  const email = session?.user?.email || "";

  return (
    <div className="p-3 border-t border-stone-200/80 bg-white/70">
      {/* User Account Card */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-amber-500/15 border border-amber-400 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
              {initial}
            </div>
            <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-pankh-clay truncate leading-tight">
              {name}
            </span>
            <span className="text-[10px] text-stone-500 truncate font-mono">
              {email}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="p-1.5 rounded-lg text-stone-400 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer shrink-0"
          title={t.profile.logout}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
