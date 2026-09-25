"use client";

import { motion } from "framer-motion";
import {
  Mic,
  Activity,
  Stethoscope,
  IndianRupee,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function FourModulesSection() {
  const { t, lang } = useLanguage();
  const m = t.marketing.modules;

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-background border-b border-border/80"
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto text-center space-y-3 mb-16"
        >
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            {m.eyebrow}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            {m.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-sans">
            {m.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Module 1: Pankh AI */}
          <motion.div
            key={m.ai.title + lang}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-2xl border-2 border-amber-300 bg-amber-50/40 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
                  <Mic className="h-3.5 w-3.5 text-amber-700" />
                  <span>{m.ai.badge}</span>
                </div>
                <span className="text-[11px] font-mono text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded">
                  {m.ai.pill}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                {m.ai.title}
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                {m.ai.desc}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-amber-900 tracking-wider">
                  {m.coreOutputLabel}
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  {m.ai.output}
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-amber-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{m.ai.bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>{m.ai.bullet2}</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 2: Pankh Sentinel */}
          <motion.div
            key={m.sentinel.title + lang}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/30 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-semibold">
                  <Activity className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{m.sentinel.badge}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-medium">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" title="Normal" />
                  <span className="h-2 w-2 rounded-full bg-amber-500" title="Watch" />
                  <span className="h-2 w-2 rounded-full bg-rose-500" title="Urgent" />
                  <span className="text-emerald-950 ml-1 font-mono">
                    {m.sentinel.pill}
                  </span>
                </div>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                {m.sentinel.title}
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                {m.sentinel.desc}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-emerald-900 tracking-wider">
                  {m.coreOutputLabel}
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  {m.sentinel.output}
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-emerald-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{m.sentinel.bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>{m.sentinel.bullet2}</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 3: Pankh Connect */}
          <motion.div
            key={m.connect.title + lang}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="rounded-2xl border-2 border-orange-300 bg-orange-50/40 p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-950 text-xs font-semibold">
                  <Stethoscope className="h-3.5 w-3.5 text-orange-700" />
                  <span>{m.connect.badge}</span>
                </div>
                <span className="text-[11px] font-mono text-orange-900 bg-orange-200/60 px-2 py-0.5 rounded">
                  {m.connect.pill}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-pankh-clay font-normal">
                {m.connect.title}
              </h3>

              <p className="text-sm text-stone-700 leading-relaxed font-sans">
                {m.connect.desc}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-white border border-orange-200 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-orange-950 tracking-wider">
                  {m.coreOutputLabel}
                </div>
                <div className="text-xs text-stone-800 font-medium">
                  {m.connect.output}
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-orange-200/80 space-y-2 text-xs text-stone-700">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-700 shrink-0" />
                <span>{m.connect.bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-orange-700 shrink-0" />
                <span>{m.connect.bullet2}</span>
              </li>
            </ul>
          </motion.div>

          {/* Module 4: Pankh Farm Economics */}
          <motion.div
            key={m.economics.title + lang}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.16 }}
            className="rounded-2xl border-2 border-indigo-900 bg-pankh-indigo text-white p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/80 border border-indigo-700 text-indigo-200 text-xs font-semibold">
                  <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{m.economics.badge}</span>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-indigo-950 px-2 py-0.5 rounded border border-indigo-800">
                  {m.economics.pill}
                </span>
              </div>

              <h3 className="font-serif text-2xl text-indigo-50 font-normal">
                {m.economics.title}
              </h3>

              <p className="text-sm text-indigo-200/90 leading-relaxed font-sans">
                {m.economics.desc}
              </p>

              <div className="mt-4 p-4 rounded-xl bg-indigo-950/90 border border-indigo-800 shadow-2xs space-y-2">
                <div className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider">
                  {m.coreOutputLabel}
                </div>
                <div className="text-xs text-indigo-100 font-medium">
                  {m.economics.output}
                </div>
              </div>
            </div>

            <ul className="mt-6 pt-5 border-t border-indigo-800/80 space-y-2 text-xs text-indigo-200">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{m.economics.bullet1}</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{m.economics.bullet2}</span>
              </li>
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
