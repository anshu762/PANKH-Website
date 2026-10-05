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

export function FarmerMobileBottomNav() {
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
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 pb-[max(env(safe-area-inset-bottom),0.35rem)] shadow-lg"
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
                "flex flex-col items-center justify-center py-1 transition-all relative min-h-[48px]",
                isActive
                  ? "text-pankh-marigold font-bold"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-7 bg-pankh-marigold rounded-full" />
              )}
              <IconComponent
                className={cn(
                  "h-5 w-5 mb-0.5 transition-transform",
                  isActive ? "text-pankh-marigold scale-110" : "text-stone-500"
                )}
              />
              <span className="text-[10px] tracking-tight leading-none text-center px-0.5 truncate w-full">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
