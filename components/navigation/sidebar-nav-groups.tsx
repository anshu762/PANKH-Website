"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import {
  Home,
  MessageSquare,
  ShieldAlert,
  Stethoscope,
  IndianRupee,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarNavGroups() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const nav = t.farmerNav;

  const navSections = [
    {
      title: "Daily Operations",
      items: [
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
      ],
    },
    {
      title: "Farm Services",
      items: [
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
      ],
    },
    {
      title: "Account & Settings",
      items: [
        {
          href: "/dashboard/profile",
          label: nav.profile,
          icon: User,
          exact: false,
        },
      ],
    },
  ];

  const checkIsActive = (itemHref: string, exact: boolean) => {
    if (exact) {
      return pathname === itemHref;
    }
    return pathname.startsWith(itemHref);
  };

  return (
    <div className="flex-1 py-2 px-3 space-y-4 overflow-y-auto no-scrollbar">
      {navSections.map((sec, secIdx) => (
        <div key={secIdx} className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-stone-400 font-mono block">
            {sec.title}
          </span>
          <div className="space-y-1">
            {sec.items.map((item) => {
              const isActive = checkIsActive(item.href, item.exact);
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[44px] group",
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
        </div>
      ))}
    </div>
  );
}
