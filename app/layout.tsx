import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_Gurmukhi } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";
import { PwaRegister } from "@/components/common/pwa-register";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  weight: ["400", "500", "600", "700"],
  subsets: ["gurmukhi"],
  variable: "--font-gurmukhi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pankh — Punjab Poultry Farm Intelligence & Early Disease Sentinel",
  description:
    "Early disease alerts, Punjabi-first AI advice, direct vet escalation, and automated flock cost tracking for broiler and layer farms in Punjab.",
};

import { cookies } from "next/headers";
import { LANGUAGE_COOKIE_NAME, DEFAULT_LANGUAGE } from "@/lib/i18n/config";
import { isValidLanguage } from "@/lib/i18n";
import { SupportedLanguage } from "@/lib/i18n/types";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const savedLang = cookieStore.get(LANGUAGE_COOKIE_NAME)?.value;
  const initialLang: SupportedLanguage =
    savedLang && isValidLanguage(savedLang)
      ? (savedLang as SupportedLanguage)
      : DEFAULT_LANGUAGE;

  return (
    <html
      lang={initialLang}
      className={`${fraunces.variable} ${manrope.variable} ${notoSansGurmukhi.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <LanguageProvider initialLanguage={initialLang}>
          {children}
          <PwaRegister />
        </LanguageProvider>
      </body>
    </html>
  );
}
