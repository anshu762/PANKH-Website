"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Activity,
  Stethoscope,
  IndianRupee,
  ShieldCheck,
  PhoneCall,
  CheckCircle,
} from "lucide-react";

export function FourModulesSection() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-background border-b border-border/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-16">
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            Four Unified Modules
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            Built for the daily workflow of a Punjab poultry shed.
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-sans">
            Not disconnected tools. An integrated ecosystem engineered to protect flock health and farmer livelihood.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module 1: Pankh AI (Marigold Glow & Voice-first) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <Mic className="h-3.5 w-3.5 text-amber-700" />
                  <span>Pankh AI • Voice & Text</span>
                </div>
                <span className="text-[11px] font-mono text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                  Gurmukhi + Hinglish
                </span>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                Speak your flock symptoms in Punjabi. Get certified veterinary guidance.
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                Trained on approved Indian Council of Agricultural Research (ICAR) and GADVASU poultry protocols. Never guesses or invents medicine names.
              </p>

              {/* Concrete Output Box */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-amber-900 tracking-wider">
                  Core Farmer Output
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  Deterministic 6-step response (Answer → Why → What to do → Ask → Escalate → Source) with explicit first-aid checks.
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-amber-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Voice input for quick hands-free logging inside the shed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>Zero hallucinated prescriptions — verified citations only</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 2: Pankh Sentinel (Tri-color Disease Risk Radar) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                  <Activity className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Pankh Sentinel • Early Warning</span>
                </div>
                {/* 3 Status indicators */}
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Normal" />
                  <span className="h-2 w-2 rounded-full bg-amber-500" title="Watch" />
                  <span className="h-2 w-2 rounded-full bg-rose-500" title="Urgent" />
                  <span className="text-emerald-950 ml-1 font-mono">Tri-Signal</span>
                </div>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                Continuous mortality and feed intake risk monitoring before an outbreak spreads.
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                Sentinel tracks daily bird mortality, feed consumption drops, and local shed weather. If numbers deviate from standard breed curves, warning alarms trigger instantly.
              </p>

              {/* Concrete Output Box */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-emerald-900 tracking-wider">
                  Core Farmer Output
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  Daily Risk Classification (Normal / Watch / Urgent) with specific signals that triggered the alert.
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-emerald-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Automatic feed drop triggers (&gt;15% drop flags immediate investigation)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Heat stress & humidity microclimate correlation with OpenWeather</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 3: Pankh Connect (Phulkari Vermilion & Vet Network) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="rounded-2xl border-2 border-orange-300 bg-orange-50/40 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-950 text-xs font-semibold">
                  <Stethoscope className="h-3.5 w-3.5 text-orange-700" />
                  <span>Pankh Connect • Vet & Lab Bridge</span>
                </div>
                <span className="text-[11px] font-mono text-orange-900 bg-orange-200/60 px-2 py-0.5 rounded">
                  Punjab District Locator
                </span>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                Direct escalation to registered poultry veterinarians and diagnostic labs.
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                When a red-flag condition is detected, Pankh bridges the farmer directly to verified veterinarians across Ludhiana, Hoshiarpur, Sangrur, and surrounding districts.
              </p>

              {/* Concrete Output Box */}
              <div className="mt-4 p-4 rounded-xl bg-white border border-orange-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-orange-950 tracking-wider">
                  Core Farmer Output
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  1-tap WhatsApp Case Package: Symptom history, photo/audio logs, flock age, and GPS coordinates bundled for doctor diagnosis.
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-orange-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-700 shrink-0" />
                <span>Verified doctor credentials & district service radius filtering</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-700 shrink-0" />
                <span>Explicit farmer data-sharing consent required before transfer</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 4: Pankh Farm Economics (Night-Indigo Financial Ledger) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border-2 border-indigo-900 bg-pankh-indigo text-white p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-700 text-indigo-200 text-xs font-semibold">
                  <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Pankh Economics • Batch Ledger</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  Live FCR & ₹/Bird
                </span>
              </div>

              <h3 className="font-serif text-2xl text-indigo-50 font-normal">
                Know your real bird cost and batch profit before lifting day.
              </h3>

              <p className="text-sm text-indigo-200/90 leading-relaxed font-sans">
                Tracks chick purchase, pre-starter/finisher feed bags, medicines, and mortality financial drain. No fake precision: incomplete data is clearly flagged with transparent assumptions.
              </p>

              {/* Concrete Output Box */}
              <div className="mt-4 p-4 rounded-xl bg-indigo-950/90 border border-indigo-800 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                  Core Farmer Output
                </div>
                <div className="text-xs text-indigo-100 font-medium">
                  Real-time Feed Conversion Ratio (FCR), net cost per kg live weight, and harvest break-even price.
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-indigo-800/80 space-y-2 text-xs text-indigo-200">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Clear distinction between hard data and assumptions (assuming ₹X/bird)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Single shared account for farm owner and shed supervisor</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
