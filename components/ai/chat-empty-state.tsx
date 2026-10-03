"use client";

import React from "react";
import { Wheat, SunMedium, Syringe, AlertTriangle, ArrowRight } from "lucide-react";

interface ChatEmptyStateProps {
  onSelectPrompt?: (promptText: string) => void;
  disabled?: boolean;
  farmerName?: string;
}

export function ChatEmptyState({ onSelectPrompt, disabled = false, farmerName }: ChatEmptyStateProps) {
  const firstName = farmerName?.trim().split(" ")[0];
  const greetingTitle = firstName
    ? `Welcome, ${firstName}! How can Pankh AI help your flock?`
    : "How can Pankh AI help your flock?";
  const examplePrompts = [
    {
      id: "feed",
      icon: Wheat,
      iconColor: "text-amber-700 bg-amber-100/70 border-amber-200",
      badge: "ਫ਼ੀਡ / Feed Management",
      title: "Day 15 Feed & FCR Standard",
      description: "15 ਦਿਨਾਂ ਦੇ ਬਰਾਇਲਰ ਦਾ ਦਾਣਾ ਅਤੇ FCR ਚਾਰਟ",
      prompt: "Day 15 broiler starter feed intake, crude protein percentage and standard FCR chart",
    },
    {
      id: "heat",
      icon: SunMedium,
      iconColor: "text-orange-700 bg-orange-100/70 border-orange-200",
      badge: "ਗਰਮੀ / Heat Stress",
      title: "Summer Shed Foggers & Sprinklers",
      description: "ਮਈ-ਜੂਨ ਗਰਮੀ ਵਿੱਚ ਸ਼ੈੱਡ ਫੌਗਰ ਅਤੇ ਛੱਤ ਸਪ੍ਰਿੰਕਲਰ ਸ਼ਡਿਊਲ",
      prompt: "May-June garmi me shed foggers aur roof sprinklers ka schedule aur electrolytes",
    },
    {
      id: "vaccine",
      icon: Syringe,
      iconColor: "text-blue-700 bg-blue-100/70 border-blue-200",
      badge: "ਟੀਕਾਕਰਨ / Vaccination",
      title: "Gumboro (IBD) & LaSota Protocol",
      description: "ਗੰਬੋਰੋ ਅਤੇ ਲਾਸੋਟਾ ਵੈਕਸੀਨ ਦੇਣ ਦਾ ਸਹੀ ਤਰੀਕਾ",
      prompt: "Gumboro (IBD) aur LaSota vaccination schedule and skim milk stabilizer",
    },
    {
      id: "redflag",
      icon: AlertTriangle,
      iconColor: "text-rose-700 bg-rose-100/70 border-rose-200",
      badge: "🚨 ਐਮਰਜੈਂਸੀ ਰੈੱਡ ਫਲੈਗ ਟੈਸਟ",
      title: "High Mortality & Twisted Necks",
      description: "ਗਰਦਨ ਮੁੜਨਾ ਅਤੇ ਅਚਾਨਕ ਮੌਤ (Test Emergency Vet Escalation)",
      prompt: "Chicks ki gardan mudi hui hai, gasping kar rahe hain aur subah se 30 mar gaye",
    },
  ];

  return (
    <div className="py-8 sm:py-14 px-4 max-w-3xl mx-auto space-y-8 animate-in fade-in">
      {/* Friendly Center Hero */}
      <div className="text-center space-y-3">
        <div className="h-14 w-14 rounded-3xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-800 font-serif font-bold text-2xl shadow-sm">
          ਪੰ
        </div>

        <div className="space-y-1">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-pankh-clay tracking-tight">
            {greetingTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            Punjab poultry medical advisory, disease surveillance, and management.
          </p>
        </div>
      </div>

      {/* 4 Spacious Suggestion Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {examplePrompts.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectPrompt && onSelectPrompt(item.prompt)}
              disabled={disabled}
              className="text-left p-4 rounded-2xl bg-white hover:bg-stone-50/90 border border-stone-200 hover:border-amber-400 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between gap-3 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between gap-2">
                <div
                  className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${item.iconColor}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                  {item.badge}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-900 group-hover:text-amber-900 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                  {item.description}
                </p>
              </div>

              <div className="flex items-center justify-end text-[11px] text-stone-400 group-hover:text-amber-700 font-semibold pt-1">
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Ask AI <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
