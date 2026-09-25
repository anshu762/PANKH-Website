"use client";

import { motion } from "framer-motion";
import { MessageSquareText, BookOpen, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function HowAiAnswersSection() {
  const { t, lang } = useLanguage();
  const h = t.marketing.howAiAnswers;

  const steps = [
    {
      step: 1,
      name: h.step1.name,
      title: h.step1.title,
      badge: h.step1.badge,
      content: (
        <p className="text-sm text-stone-800 leading-relaxed font-sans">
          {h.step1.text}
        </p>
      ),
    },
    {
      step: 2,
      name: h.step2.name,
      title: h.step2.title,
      badge: h.step2.badge,
      content: (
        <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
          {h.step2.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      step: 3,
      name: h.step3.name,
      title: h.step3.title,
      badge: h.step3.badge,
      content: (
        <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
          {h.step3.bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="font-semibold text-amber-800">{idx + 1}.</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      step: 4,
      name: h.step4.name,
      title: h.step4.title,
      badge: h.step4.badge,
      content: (
        <p className="text-xs text-stone-800 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 font-sans">
          {h.step4.text}
        </p>
      ),
    },
    {
      step: 5,
      name: h.step5.name,
      title: h.step5.title,
      badge: h.step5.badge,
      content: (
        <div className="flex items-start gap-2.5 text-xs text-rose-900 bg-rose-50/80 p-3 rounded-lg border border-rose-200">
          <AlertCircle className="h-4 w-4 text-rose-700 mt-0.5 shrink-0" />
          <span>{h.step5.text}</span>
        </div>
      ),
    },
    {
      step: 6,
      name: h.step6.name,
      title: h.step6.title,
      badge: h.step6.badge,
      content: (
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100 p-2.5 rounded border border-stone-200 font-mono">
          <BookOpen className="h-3.5 w-3.5 text-stone-700 shrink-0" />
          <span>{h.step6.text}</span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-pankh-paper border-b border-border/80">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          key={lang}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-3 mb-14"
        >
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            {h.eyebrow}
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            {h.title}
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-sans max-w-xl mx-auto">
            {h.subtitle}
          </p>
        </motion.div>

        {/* Real Farmer Question Card */}
        <div className="mb-8 rounded-xl bg-white border border-stone-300 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <MessageSquareText className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-500 mb-0.5">
              {h.questionContext}
            </div>
            <p className="text-sm sm:text-base font-medium text-pankh-clay">
              {h.questionText}
            </p>
          </div>
        </div>

        {/* 6-Step Visual Sequence */}
        <div className="space-y-4">
          {steps.map((item, index) => (
            <motion.div
              key={item.step + lang}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
              className="rounded-xl border border-stone-200 bg-white p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-start gap-4"
            >
              {/* Number marker */}
              <div className="flex items-center gap-3 sm:block sm:w-28 shrink-0">
                <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-pankh-clay text-white font-mono text-xs font-bold">
                  {item.step}
                </span>
                <span className="text-xs font-bold text-stone-800 sm:block sm:mt-1 uppercase tracking-wide">
                  {item.name}
                </span>
              </div>

              {/* Main content body */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-stone-900">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                    {item.badge}
                  </span>
                </div>
                {item.content}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
