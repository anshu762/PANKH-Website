"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  CheckCircle2,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getNotificationsAction,
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/actions/notification";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  severity: string;
  linkUrl?: string | null;
  read: boolean;
  sentViaWhatsApp: boolean;
  sentViaSms: boolean;
  createdAt: string | Date;
}

function formatRelativeTime(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "UNREAD">("ALL");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Fetch notifications on mount and set polling interval
  const loadNotifications = async () => {
    try {
      const res = await getNotificationsAction();
      if (res && res.notifications) {
        setNotifications(res.notifications as any);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {
      console.error("Could not fetch notifications:", e);
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60000); // Poll once per minute
    return () => clearInterval(interval);
  }, []);

  // 2. Click outside & Escape dismiss handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleMarkAsRead = async (id: string, linkUrl?: string | null) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await markNotificationReadAction(id);
    } catch (e) {
      console.error("Error marking notification read:", e);
    }

    if (linkUrl) {
      setIsOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    setIsLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await markAllNotificationsReadAction();
    } catch (e) {
      console.error("Error marking all read:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    if (activeTab === "UNREAD") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "CRITICAL" || type === "RED_ALERT") {
      return (
        <div className="h-8 w-8 rounded-xl bg-red-100 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
          <ShieldAlert className="h-4 w-4" />
        </div>
      );
    }
    if (severity === "WARNING" || type === "AMBER_ALERT") {
      return (
        <div className="h-8 w-8 rounded-xl bg-amber-100 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0 shadow-2xs">
          <AlertTriangle className="h-4 w-4" />
        </div>
      );
    }
    if (type === "CHECKIN_REMINDER") {
      return (
        <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
          <Clock className="h-4 w-4" />
        </div>
      );
    }
    if (type === "VACCINATION_DUE") {
      return (
        <div className="h-8 w-8 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
          <CheckCircle2 className="h-4 w-4" />
        </div>
      );
    }
    if (type === "WEEKLY_ECONOMICS") {
      return (
        <div className="h-8 w-8 rounded-xl bg-indigo-100 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0 shadow-2xs">
          <TrendingUp className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="h-8 w-8 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 flex items-center justify-center shrink-0 shadow-2xs">
        <AlertCircle className="h-4 w-4" />
      </div>
    );
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        aria-expanded={isOpen}
        className={cn(
          "relative h-9 w-9 rounded-xl flex items-center justify-center transition-all cursor-pointer outline-none shadow-2xs",
          isOpen
            ? "bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-500/20"
            : "bg-white/80 hover:bg-white text-stone-700 hover:text-pankh-clay border border-stone-200/90"
        )}
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-mono font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Modern Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-[340px] sm:w-[400px] max-w-[calc(100vw-24px)] rounded-3xl bg-white/95 backdrop-blur-xl border border-stone-200/90 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#FAF9F5] border-b border-stone-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-pankh-clay tracking-tight">
                ਸੂਚਨਾਵਾਂ • Alerts
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold border border-red-200 shadow-2xs">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[11px] font-bold text-stone-600 hover:text-pankh-clay flex items-center gap-1 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-stone-100"
              >
                <CheckCheck className="h-3.5 w-3.5 text-stone-500" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-3 pt-2 pb-1.5 bg-stone-50/70 border-b border-stone-100 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab("ALL")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer",
                activeTab === "ALL"
                  ? "bg-white text-pankh-clay font-bold shadow-2xs border border-stone-200"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("UNREAD")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1",
                activeTab === "UNREAD"
                  ? "bg-white text-pankh-clay font-bold shadow-2xs border border-stone-200"
                  : "text-stone-500 hover:text-stone-900"
              )}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-red-600" />
              )}
            </button>
          </div>

          {/* List Area */}
          <div className="max-h-[360px] overflow-y-auto no-scrollbar divide-y divide-stone-100">
            {filteredNotifications.length === 0 ? (
              <div className="py-10 px-4 text-center space-y-2.5">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-2xs">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-stone-800">
                    ਕੋਈ ਨਵੀਂ ਸੂਚਨਾ ਨਹੀਂ • All Caught Up
                  </p>
                  <p className="text-[11px] text-stone-500 max-w-[240px] mx-auto">
                    Your flock health indicators and tasks are up to date.
                  </p>
                </div>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const relativeTime = formatRelativeTime(item.createdAt);

                return (
                  <div
                    key={item.id}
                    onClick={() => handleMarkAsRead(item.id, item.linkUrl)}
                    className={cn(
                      "p-3.5 hover:bg-stone-50/90 transition-colors cursor-pointer text-left flex gap-3 items-start relative group",
                      !item.read ? "bg-amber-50/30" : "bg-white"
                    )}
                  >
                    {/* Icon */}
                    <div className="mt-0.5">
                      {getNotificationIcon(item.type, item.severity)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs font-bold truncate block",
                            !item.read ? "text-stone-900 font-extrabold" : "text-stone-700"
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {relativeTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                        {item.body}
                      </p>

                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {item.sentViaWhatsApp && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <MessageSquare className="h-2.5 w-2.5" />
                            WhatsApp Sent
                          </span>
                        )}
                        {item.linkUrl && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-pankh-marigold font-bold group-hover:underline">
                            <span>Open details</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Unread dot indicator */}
                    {!item.read && (
                      <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0 mt-1.5 ring-2 ring-amber-200" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-[#FAF9F5] border-t border-stone-200/80 flex items-center justify-between text-[10px] text-stone-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sentinel Live Surveillance</span>
            </span>
            <span className="font-mono text-[9px] text-stone-400">PANKH</span>
          </div>
        </div>
      )}
    </div>
  );
}
