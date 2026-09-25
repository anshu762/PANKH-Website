"use client";

import { motion } from "framer-motion";
import { MessageSquareText, ShieldAlert, Sparkles, BookOpen, AlertCircle } from "lucide-react";

export function HowAiAnswersSection() {
  const steps = [
    {
      step: 1,
      name: "Answer",
      title: "Direct Immediate Assessment",
      badge: "No Generic Chat",
      content: (
        <p className="text-sm text-stone-800 leading-relaxed font-sans">
          <strong>Antibiotic bilkul mat dijiye.</strong> Chicks ka corner me ikkattha (huddling) hona aur feed kam khana thand lagne (temperature stress) ka typical pattern hai, kisi bacterial infection ka nahi.
        </p>
      ),
    },
    {
      step: 2,
      name: "Why",
      title: "Biological Reasons",
      badge: "1-3 Plain Bullets",
      content: (
        <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
            <span>Pehle hafte ke broiler chicks apna body temperature khud regulate nahi kar pate.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
            <span>Corner me jama hona saaf batata hai ki shed ka floor temperature 32°C se niche gir gaya hai.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
            <span>Thand se unka pachan (gizzard activity) slow ho jata hai, isliye daana khana chhod dete hain.</span>
          </li>
        </ul>
      ),
    },
    {
      step: 3,
      name: "What to do now",
      title: "Immediate Physical Actions",
      badge: "Actionable First-Aid",
      content: (
        <ul className="space-y-1.5 text-xs text-stone-700 font-sans">
          <li className="flex items-start gap-2">
            <span className="font-semibold text-amber-800">1.</span>
            <span>Brooder lamp ki height kam karein aur chick level par temperature 33°C to 34°C ensure karein.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-amber-800">2.</span>
            <span>Direct thandi hawa rokne ke liye bahar ke curtains ko 70% band karein, par cross-ventilation na rokein.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-semibold text-amber-800">3.</span>
            <span>Pehle 6 ghante ke liye peene ke paani me Electrolyte + 5% Glucose dein taaki body energy recover ho sake.</span>
          </li>
        </ul>
      ),
    },
    {
      step: 4,
      name: "Ask",
      title: "Diagnostic Follow-up",
      badge: "Only If Needed",
      content: (
        <p className="text-xs text-stone-800 italic bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60 font-sans">
          &ldquo;Kya chicks lagatar tezz awaaz (loud chirping) nikal rahe hain? Aur unka litter dry hai ya geela lag raha hai?&rdquo;
        </p>
      ),
    },
    {
      step: 5,
      name: "Escalate",
      title: "Deterministic Red-Flag Gate",
      badge: "Veterinary Rule Layer",
      content: (
        <div className="flex items-start gap-2.5 text-xs text-rose-900 bg-rose-50/80 p-3 rounded-lg border border-rose-200">
          <AlertCircle className="h-4 w-4 text-rose-700 mt-0.5 shrink-0" />
          <span>
            <strong>RED FLAG RULE:</strong> Agar agle 6 ghante me temperature set karne ke baad bhi mortality 5 birds se upar jaye ya gasping (munh khol ke saans lena) dekhein, to Pankh Connect button dabakar turant nearby vet se WhatsApp case share karein.
          </span>
        </div>
      ),
    },
    {
      step: 6,
      name: "Source",
      title: "Verifiable Knowledge Base Citation",
      badge: "Retrieved, Never Invented",
      content: (
        <div className="flex items-center gap-2 text-xs text-stone-600 bg-stone-100 p-2.5 rounded border border-stone-200 font-mono">
          <BookOpen className="h-3.5 w-3.5 text-stone-700 shrink-0" />
          <span>Based on: GADVASU Poultry Brooding Protocol &amp; ICAR Broiler Management Manual (v2.4)</span>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-pankh-paper border-b border-border/80">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center space-y-3 mb-14">
          <p className="text-xs font-semibold tracking-wider text-amber-900 uppercase">
            Rigorous Response Architecture
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
            How Pankh AI answers — deterministic, structured, verified.
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-sans max-w-xl mx-auto">
            Every health answer follows an unbreachable 6-step protocol. No casual conversation, no guessing, no raw LLM memory.
          </p>
        </div>

        {/* Real Farmer Question Card */}
        <div className="mb-8 rounded-xl bg-white border border-stone-300 p-5 shadow-2xs flex items-start gap-3.5">
          <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
            <MessageSquareText className="h-4 w-4 text-amber-800" />
          </div>
          <div>
            <div className="text-xs font-semibold text-stone-500 mb-0.5">
              Real Farmer Voice Query (Hinglish / Sangrur District)
            </div>
            <p className="text-sm sm:text-base font-medium text-pankh-clay">
              &ldquo;Bhai, 4 din ke broiler chicks hain, corner me ikkattha ho rahe hain aur daana kam kha rahe hain. Kya antibiotic de dein?&rdquo;
            </p>
          </div>
        </div>

        {/* 6-Step Visual Sequence */}
        <div className="space-y-4">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
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
