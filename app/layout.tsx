import type { Metadata } from "next";
import { Fraunces, Manrope, Noto_Sans_Gurmukhi } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/context/language-context";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pa"
      className={`${fraunces.variable} ${manrope.variable} ${notoSansGurmukhi.variable}`}
    >
      <body className="font-sans antialiased bg-background text-foreground min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
