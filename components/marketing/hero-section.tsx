"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion } from "framer-motion";
import { ShieldCheck, WifiOff, Users2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function HeroSection() {
  const { t, lang } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const h = t.marketing.hero;

  // Single coordinated orchestrator for the page-load reveal
  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.14,
        delayChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 14 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const svgDrawVariants = {
    hidden: { pathLength: shouldReduceMotion ? 1 : 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/70 bg-gradient-to-b from-background via-background to-pankh-paper">
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          key={lang}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Bold Editorial Fraunces Content */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium"
            >
              <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
              <span>{h.badge}</span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-pankh-clay leading-[1.14]"
            >
              {h.headline}
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-stone-700 leading-relaxed font-sans max-w-xl"
            >
              {lang !== "pa" && (
                <span className="block font-gurmukhi text-amber-950 font-semibold mb-1">
                  {h.subheadlineGurmukhi}
                </span>
              )}
              {h.subheadline}
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] px-7 text-base font-medium bg-pankh-marigold hover:bg-amber-700 text-white shadow-sm border border-amber-800/20"
                >
                  {h.ctaPrimary}
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] px-6 text-base font-medium border-stone-300 text-stone-800 hover:bg-stone-100"
                >
                  {h.ctaSecondary}
                </Button>
              </a>
            </motion.div>

            {/* Grounded Trust Anchors */}
            <motion.div
              variants={itemVariants}
              className="pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{h.trustZeroFee}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users2 className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{h.trustOneAccount}</span>
              </div>
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4 text-blue-700 shrink-0" />
                <span>{h.trustOffline}</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Stylized Hen + Mustard/Wheat Silhouettes + Pulsing Radar */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-[420px] aspect-[4/3.8] rounded-2xl bg-amber-50/50 border border-amber-200/60 p-6 flex flex-col justify-between overflow-hidden shadow-xs">
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#18181B 1px, transparent 1px)`,
                  backgroundSize: "18px 18px",
                }}
              />

              {/* Pulsing Sentinel Signal Dot (Top Right) */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 ring-4 ring-emerald-100 animate-pulse" />
                  <span className="font-semibold text-emerald-900">
                    {h.sentinelActive}
                  </span>
                  <span className="text-stone-400">|</span>
                  <span className="text-stone-500 font-mono text-[11px]">
                    34.2°C • 62% RH
                  </span>
                </div>
                <span className="text-[11px] bg-white border border-stone-200 rounded px-2 py-0.5 font-medium text-stone-600">
                  {h.shedLabel}
                </span>
              </div>

              {/* Animated Hen & Wheat Silhouettes SVG Motif */}
              <div className="relative z-10 my-auto flex items-center justify-center py-4">
                <svg
                  viewBox="0 0 320 220"
                  className="w-full h-auto max-h-[190px] drop-shadow-xs"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g
                    stroke="#D97706"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.35"
                  >
                    <path d="M 40 210 Q 55 130 65 80" />
                    <path d="M 65 80 L 52 70 M 65 80 L 78 74 M 60 100 L 48 94 M 60 100 L 73 98" />
                    <path d="M 270 210 Q 255 125 245 75" />
                    <path d="M 245 75 L 235 66 M 245 75 L 257 68 M 250 96 L 238 90 M 250 96 L 261 93" />
                  </g>

                  {/* Tail plumage */}
                  <motion.path
                    variants={svgDrawVariants}
                    d="M 100 130 C 75 105 70 70 85 45 C 95 65 110 85 120 100"
                    stroke="#D97706"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <motion.path
                    variants={svgDrawVariants}
                    d="M 90 120 C 70 95 72 65 80 50 C 95 72 105 92 115 110"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  {/* Hen Body & Chest contour */}
                  <motion.path
                    variants={svgDrawVariants}
                    d="M 115 105 C 130 80 160 70 185 85 C 205 95 215 115 210 145 C 205 170 175 185 145 180 C 120 175 105 150 115 105 Z"
                    stroke="#18181B"
                    strokeWidth="2.5"
                    fill="#FFFDF7"
                  />

                  {/* Hen Neck & Head */}
                  <motion.path
                    variants={svgDrawVariants}
                    d="M 185 85 C 190 70 195 55 205 45 C 215 45 225 55 220 70 C 215 85 205 95 195 100"
                    stroke="#18181B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />

                  {/* Comb in Phulkari Vermilion */}
                  <path
                    d="M 205 43 C 203 36 210 32 214 36 C 217 31 224 33 224 38 C 228 35 233 39 230 46 Z"
                    fill="#EA580C"
                  />
                  <circle cx="213" cy="53" r="2.5" fill="#18181B" />
                  <path d="M 222 55 L 234 59 L 222 64 Z" fill="#F59E0B" />
                  <path
                    d="M 218 64 C 222 72 212 76 214 66 Z"
                    fill="#EA580C"
                  />

                  {/* Wing Line */}
                  <path
                    d="M 135 125 C 150 115 175 120 180 140 C 175 155 155 160 140 150 Z"
                    stroke="#D97706"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    fill="#FEF3C7"
                  />

                  {/* Legs */}
                  <path
                    d="M 148 180 L 148 205 M 148 205 L 140 208 M 148 205 L 156 208"
                    stroke="#18181B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 168 178 L 168 205 M 168 205 L 160 208 M 168 205 L 176 208"
                    stroke="#18181B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <line
                    x1="30"
                    y1="208"
                    x2="290"
                    y2="208"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Bottom live indicator badge */}
              <div className="relative z-10 pt-2 border-t border-amber-200/50 flex items-center justify-between text-[11px] text-stone-600">
                <span className="font-medium text-amber-950">
                  {h.broilerBatch}
                </span>
                <span className="text-emerald-700 font-semibold font-mono">
                  {h.fcrStatus}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
