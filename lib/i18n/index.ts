import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from "./config";
import { enDictionary } from "./dictionaries/en";
import { paDictionary } from "./dictionaries/pa";
import { hiDictionary } from "./dictionaries/hi";
import { hinglishDictionary } from "./dictionaries/hinglish";
import { Dictionary, SupportedLanguage } from "./types";

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  pa: paDictionary,
  en: enDictionary,
  hi: hiDictionary,
  hinglish: hinglishDictionary,
};

export function getDictionary(lang: SupportedLanguage = DEFAULT_LANGUAGE): Dictionary {
  return dictionaries[lang] || dictionaries[DEFAULT_LANGUAGE];
}

export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.some((item) => item.code === lang);
}

export * from "./types";
export * from "./config";
