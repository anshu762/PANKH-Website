"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";

export function FooterSection() {
  const { t, lang } = useLanguage();
  const f = t.marketing.footer;

  return (
    <footer className="bg-pankh-clay text-stone-300 py-14 border-t border-stone-800">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-serif text-2xl text-white font-normal">
                {t.common.platformName}
              </span>
              <span className="text-xs text-amber-400 font-gurmukhi border border-amber-500/40 px-2 py-0.5 rounded">
                {t.common.tagline}
              </span>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed font-sans max-w-md">
              {f.desc}
            </p>
          </div>

          {/* Core Modules Links */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-200 tracking-wider uppercase text-[11px] mb-2 font-sans">
              {f.modulesColTitle}
            </div>
            <ul className="space-y-2 font-sans text-stone-400">
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.moduleAi}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.moduleSentinel}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.moduleConnect}
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.moduleEconomics}
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-2 text-xs">
            <div className="font-bold text-stone-200 tracking-wider uppercase text-[11px] mb-2 font-sans">
              {f.farmerColTitle}
            </div>
            <ul className="space-y-2 font-sans text-stone-400">
              <li>
                <Link
                  href="/login"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.farmerLogin}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.createAccount}
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-amber-400 transition-colors"
                >
                  {f.vetPortal}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Portfolio Credit */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 font-sans">
          <p>{f.disclaimer}</p>
          <p className="text-stone-400 font-medium">
            {f.creditPre}{" "}
            <span className="text-amber-400">{f.creditAuthor}</span>{" "}
            {f.creditPost}
          </p>
        </div>
      </div>
    </footer>
  );
}
