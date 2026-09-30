"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof window !== "undefined") {
      setIsOffline(!window.navigator.onLine);

      const handleOnline = () => {
        setIsReconnecting(true);
        setTimeout(() => {
          setIsOffline(false);
          setIsReconnecting(false);
        }, 1200);
      };

      const handleOffline = () => {
        setIsOffline(true);
      };

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  if (!isOffline && !isReconnecting) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-16 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 p-3.5 rounded-2xl bg-stone-900/95 text-white backdrop-blur-md shadow-2xl border border-stone-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400">
          {isReconnecting ? (
            <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
          ) : (
            <WifiOff className="h-4 w-4" />
          )}
        </div>
        <div className="min-w-0 text-xs">
          <span className="font-bold block truncate">
            {isReconnecting ? "Reconnecting to Network..." : "Offline Mode (ਆਫ਼ਲਾਈਨ ਮੋਡ)"}
          </span>
          <span className="text-[11px] text-stone-300 block truncate">
            {isReconnecting
              ? "Syncing latest flock updates..."
              : "Form drafts preserved locally. Viewing cached data."}
          </span>
        </div>
      </div>

      {!isReconnecting && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-600 shrink-0 transition-colors"
        >
          Check Now
        </button>
      )}
    </div>
  );
}
