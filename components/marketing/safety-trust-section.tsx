"use client";

import { motion } from "framer-motion";
import { ShieldAlert, CheckCircle2, Lock, FileSearch } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function SafetyTrustSection() {
  const { t, lang } = useLanguage();
  const s = t.marketing.safety;

  const safetyGuarantees = [
    {
      title: s.pillar1Title,
      desc: s.pillar1Desc,
      icon: ShieldAlert,
    },
    {
      title: s.pillar2Title,
      desc: s.pillar2Desc,
      icon: Lock,
    },
    {
      title: s.pillar3Title,
      desc: s.pillar3Desc,
      icon: FileSearch,
    },
  ];

  return (
    <section className="py-20 bg-background border-b border-border/80">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/70 via-white to-stone-50 p-8 sm:p-12 shadow-xs space-y-8"
        >
          {/* Header & Core Non-Negotiable Rule */}
          <div className="space-y-4 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/90 text-amber-950 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-amber-800" />
              <span>{s.badge}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
              {s.quote}
            </h2>

            <p className="text-sm sm:text-base text-stone-700 font-sans leading-relaxed">
              {s.desc}
            </p>
          </div>

          {/* 3 Safety Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-amber-200/60">
            {safetyGuarantees.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="space-y-2">
                  <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Icon className="h-4.5 w-4.5 text-amber-900" />
                  </div>
                  <h3 className="text-sm font-bold text-pankh-clay font-sans">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
