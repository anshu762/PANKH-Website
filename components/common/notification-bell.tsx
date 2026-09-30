"use client";

import React, { useState, useEffect, useRef } from "react";
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

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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

  // 2. Click outside handler to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const getNotificationIcon = (type: string, severity: string) => {
    if (severity === "CRITICAL" || type === "RED_ALERT") {
      return <ShieldAlert className="h-4 w-4 text-red-600 shrink-0" />;
    }
    if (severity === "WARNING" || type === "AMBER_ALERT") {
      return <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />;
    }
    if (type === "CHECKIN_REMINDER") {
      return <Clock className="h-4 w-4 text-amber-600 shrink-0" />;
    }
    if (type === "VACCINATION_DUE") {
      return <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />;
    }
    if (type === "WEEKLY_ECONOMICS") {
      return <TrendingUp className="h-4 w-4 text-indigo-600 shrink-0" />;
    }
    return <AlertCircle className="h-4 w-4 text-stone-500 shrink-0" />;
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative h-9 w-9 rounded-xl flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors focus:outline-hidden"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center px-1 rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-stone-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-[#FAF9F5] border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-pankh-clay">
                ਸੂਚਨਾਵਾਂ (Alerts)
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-100 text-red-800 font-bold border border-red-200">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={isLoading}
                className="text-[11px] font-bold text-stone-600 hover:text-pankh-clay flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-600/60 mx-auto" />
                <p className="text-xs font-bold text-stone-700">ਕੋਈ ਨਵੀਂ ਸੂਚਨਾ ਨਹੀਂ</p>
                <p className="text-[11px] text-stone-500">
                  Your flock indicators and tasks are up to date.
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const dateFormatted = new Date(item.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Kolkata",
                });

                return (
                  <div
                    key={item.id}
                    onClick={() => handleMarkAsRead(item.id, item.linkUrl)}
                    className={cn(
                      "p-3.5 hover:bg-stone-50 transition-colors cursor-pointer text-left flex gap-3 items-start",
                      !item.read ? "bg-amber-50/40" : "bg-white"
                    )}
                  >
                    <div className="mt-0.5">{getNotificationIcon(item.type, item.severity)}</div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-xs font-bold truncate block",
                            !item.read ? "text-stone-900" : "text-stone-600"
                          )}
                        >
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {dateFormatted}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-snug line-clamp-2">
                        {item.body}
                      </p>

                      <div className="flex items-center gap-2 pt-1">
                        {item.sentViaWhatsApp && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <MessageSquare className="h-2.5 w-2.5" />
                            WhatsApp Sent
                          </span>
                        )}
                        {item.linkUrl && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-pankh-clay font-bold hover:underline">
                            <span>Open</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 text-center">
            <span className="text-[10px] text-stone-400">
              Pankh Automated Early Surveillance & Reminders
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
