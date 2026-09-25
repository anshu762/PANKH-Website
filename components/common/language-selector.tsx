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

  // Pill Switch (Punjabi / English instant 1-tap toggle + more options)
  if (variant === "pill") {
    const quickOptions: { code: SupportedLanguage; label: string }[] = [
      { code: "pa", label: "ਪੰਜਾਬੀ" },
      { code: "en", label: "English" },
    ];

    return (
      <div
        className={cn(
          "inline-flex items-center p-1 rounded-full bg-muted/80 border border-border/60 text-xs font-medium backdrop-blur-sm shadow-sm",
          className
        )}
        role="group"
        aria-label="Language selection"
      >
        {quickOptions.map((opt) => {
          const isActive = lang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={cn(
                "relative px-3 py-1 rounded-full transition-colors font-medium z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isActive
                  ? "text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeLangPill"
                  className="absolute inset-0 bg-primary rounded-full -z-10 shadow-sm"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              {opt.label}
            </button>
          );
        })}

        {/* Extended Dropdown button for Hindi & Hinglish */}
        <div className="relative ml-0.5" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors hover:bg-background/60",
              (lang === "hi" || lang === "hinglish") &&
                "text-primary font-semibold"
            )}
            title="More languages"
            aria-label="More languages"
            aria-expanded={isOpen}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 rounded-xl bg-card border border-border shadow-lg p-1.5 z-50 text-xs"
              >
                {supportedLanguages.map((item) => {
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
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      <span>{item.nativeName}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Compact Pill (pa / en badge)
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 rounded-full bg-muted border border-border text-xs",
          className
        )}
      >
        <button
          type="button"
          onClick={() => setLanguage(lang === "pa" ? "en" : "pa")}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full text-foreground hover:text-primary transition-colors font-medium"
        >
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span>{lang === "pa" ? "English" : "ਪੰਜਾਬੀ"}</span>
        </button>
      </div>
    );
  }

  // Full Dropdown Menu Variant
  const currentLangInfo = supportedLanguages.find((item) => item.code === lang);

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-input bg-background/80 hover:bg-accent hover:text-accent-foreground text-xs font-medium transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{currentLangInfo?.nativeName || "ਪੰਜਾਬੀ"}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-44 rounded-xl bg-card border border-border shadow-lg p-1.5 z-50 text-xs"
          >
            <div className="px-2 py-1 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              Select Language / ਭਾਸ਼ਾ
            </div>
            {supportedLanguages.map((item) => {
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
                      ? "bg-primary/10 text-primary font-semibold"
                      : "text-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{item.nativeName}</span>
                    <span className="text-[10px] text-muted-foreground">
                      {item.name}
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
