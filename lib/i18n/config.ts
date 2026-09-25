import { LanguageInfo, SupportedLanguage } from "./types";

export const DEFAULT_LANGUAGE: SupportedLanguage = "pa";

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: "pa",
    name: "Punjabi",
    nativeName: "ਪੰਜਾਬੀ",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
  },
  {
    code: "hi",
    name: "Hindi",
    nativeName: "हिन्दी",
  },
  {
    code: "hinglish",
    name: "Hinglish",
    nativeName: "Hinglish",
  },
];

export const LANGUAGE_COOKIE_NAME = "pankh_lang";
export const LANGUAGE_STORAGE_KEY = "pankh_lang";
