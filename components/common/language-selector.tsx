"use client";

import React, { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/use-language";
import { SupportedLanguage } from "@/lib/i18n/types";
import { Globe, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  variant?: "pill" | "dropdown" | "compact";
  className?: string;
}

interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  mobileLabel: string;
  nativeName: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: "pa", label: "ਪੰਜਾਬੀ", mobileLabel: "ਪੰਜਾਬੀ", nativeName: "ਪੰਜਾਬੀ (Gurmukhi)" },
  { code: "en", label: "English", mobileLabel: "EN", nativeName: "English" },
  { code: "hi", label: "हिन्दी", mobileLabel: "हिन्दी", nativeName: "हिन्दी (Hindi)" },
];

export function LanguageSelector({
  variant = "pill",
  className,
}: LanguageSelectorProps) {
  const { lang, setLanguage, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Pill Switch - Direct 1-tap access to all 4 languages with animated orange indicator
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 sm:p-1 rounded-full bg-stone-100/90 border border-stone-200/80 text-xs font-medium backdrop-blur-sm shadow-xs",
          className
        )}
        role="group"
        aria-label="Language selection"
      >
        {LANGUAGE_OPTIONS.map((opt) => {
          const isActive = lang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={cn(
                "relative px-2.5 sm:px-3 py-1 rounded-full transition-colors text-xs z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary whitespace-nowrap",
                isActive
                  ? "text-primary-foreground font-bold"
                  : "text-stone-600 hover:text-stone-900 font-medium"
              )}
              title={opt.label}
              aria-pressed={isActive}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <span className="hidden sm:inline">{opt.label}</span>
              <span className="sm:hidden">{opt.mobileLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Pill (cycles through languages on tap)
  if (variant === "compact") {
    const currentOpt =
      LANGUAGE_OPTIONS.find((o) => o.code === lang) || LANGUAGE_OPTIONS[0];

    const cycleLanguage = () => {
      const currentIndex = LANGUAGE_OPTIONS.findIndex((o) => o.code === lang);
      const nextIndex = (currentIndex + 1) % LANGUAGE_OPTIONS.length;
      setLanguage(LANGUAGE_OPTIONS[nextIndex].code);
    };

    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 rounded-full bg-muted border border-border text-xs",
          className
        )}
      >
        <button
          type="button"
          onClick={cycleLanguage}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-foreground hover:text-primary transition-colors font-medium"
          title="Switch language"
        >
          <Globe className="h-3 w-3 text-primary" />
          <span className="font-semibold text-primary">{currentOpt.label}</span>
        </button>
      </div>
    );
  }

  // Full Dropdown Menu Variant
  const currentLangInfo =
    supportedLanguages.find((item) => item.code === lang) ||
    supportedLanguages[0];

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-background/80 hover:bg-accent hover:text-accent-foreground text-xs font-medium transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="font-semibold">{currentLangInfo.nativeName}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-lg p-1.5 z-50 text-xs"
          >
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Select Language / ਭਾਸ਼ਾ
            </div>
            {LANGUAGE_OPTIONS.map((item) => {
              const isSelected = lang === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    setLanguage(item.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors",
                    isSelected
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.nativeName}
                    </span>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
