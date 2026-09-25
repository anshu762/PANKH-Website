"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  LANGUAGE_STORAGE_KEY,
  SUPPORTED_LANGUAGES,
} from "@/lib/i18n/config";
import { getDictionary, isValidLanguage } from "@/lib/i18n";
import { Dictionary, LanguageInfo, SupportedLanguage } from "@/lib/i18n/types";

interface LanguageContextType {
  lang: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Dictionary;
  supportedLanguages: LanguageInfo[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLanguage = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}) {
  const [lang, setLangState] = useState<SupportedLanguage>(initialLanguage);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Read from localStorage or cookie on client mount
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && isValidLanguage(stored)) {
        setLangState(stored);
      } else {
        // Fallback: check cookie
        const match = document.cookie
          .split("; ")
          .find((row) => row.startsWith(`${LANGUAGE_COOKIE_NAME}=`));
        if (match) {
          const cookieVal = match.split("=")[1];
          if (cookieVal && isValidLanguage(cookieVal)) {
            setLangState(cookieVal);
          }
        }
      }
    } catch {
      // LocalStorage access may be restricted
    } finally {
      setIsInitialized(true);
    }
  }, []);

  const setLanguage = (newLang: SupportedLanguage) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
      // Set cookie for 1 year (31536000 seconds)
      document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLang}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLang;
      }
    } catch {
      // Handle private browsing or restricted cookies
    }
  };

  useEffect(() => {
    if (typeof document !== "undefined" && isInitialized) {
      document.documentElement.lang = lang;
    }
  }, [lang, isInitialized]);

  const t = getDictionary(lang);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLanguage,
        t,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
