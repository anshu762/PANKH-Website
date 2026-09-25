"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Mic2, Smartphone, WifiOff, Volume2 } from "lucide-react";
import { SupportedLanguage } from "@/lib/i18n/types";

export function LanguageAccessibilitySection() {
  const [activeDemoLang, setActiveDemoLang] = useState<SupportedLanguage>("pa");

  const demoAlerts: Record<
    SupportedLanguage,
    {
      title: string;
      body: string;
      audioPrompt: string;
      source: string;
    }
  > = {
    pa: {
      title: "ਸ਼ੈੱਡ #2 ਚੇਤਾਵਨੀ: ਖੁਰਾਕ ਅਤੇ ਮੌਤ ਦਰ ਅਲਰਟ",
      body: "ਅੱਜ ਮੌਤ ਦਰ 0.6% ਦਰਜ ਹੋਈ ਹੈ ਅਤੇ ਪਾਣੀ ਦੀ ਖਪਤ 12% ਘਟੀ ਹੈ। ਸ਼ੈੱਡ ਤਾਪਮਾਨ 33°C 'ਤੇ ਜਾਂਚੋ ਅਤੇ ਪੰਖ ਕਨੈਕਟ ਰਾਹੀਂ ਵੈਟਰਨਰੀ ਸਲਾਹ ਲਵੋ।",
      audioPrompt: "ਆਵਾਜ਼ ਸੁਣੋ: 'ਮੁਰਗੀਆਂ ਦਾ ਪਾਣੀ ਘੱਟ ਰਿਹਾ ਹੈ, ਤੁਰੰਤ ਤਾਪਮਾਨ ਚੈੱਕ ਕਰੋ...'",
      source: "ਪੰਖ ਸੈਂਟੀਨਲ ਅਲਰਟ • ਲੁਧਿਆਣਾ ਜ਼ਿਲ੍ਹਾ",
    },
    en: {
      title: "Shed #2 Warning: Feed & Mortality Anomaly",
      body: "Daily mortality reached 0.6% with a 12% drop in water intake. Verify brooder temperatures (target 33°C) and consult nearby vets via Pankh Connect.",
      audioPrompt: "Audio prompt: 'Water intake is dropping, inspect shed brooding temperature...'",
      source: "Pankh Sentinel Alert • Ludhiana District",
    },
    hi: {
      title: "शेड #2 चेतावनी: दाना और मृत्यु दर अलर्ट",
      body: "आज मृत्यु दर 0.6% दर्ज हुई है और पानी की खपत 12% गिरी है। शेड का तापमान 33°C पर जांचें और पंख कनेक्ट से डॉक्टर की सलाह लें।",
      audioPrompt: "आवाज़ सुनें: 'मुर्गियों का पानी कम हो रहा है, तुरंत तापमान चेक करें...'",
      source: "पंख सेंटिनल अलर्ट • लुधियाना ज़िला",
    },
    hinglish: {
      title: "Shed #2 Warning: Feed Aur Mortality Alert",
      body: "Aaj mortality 0.6% record hui hai aur paani ka intake 12% gira hai. Brooder temperature 33°C par layein aur turant vet se consult karein.",
      audioPrompt: "Voice prompt: 'Chicks paani kam pee rahe hain, turant ventilation check karein...'",
      source: "Pankh Sentinel Alert • Ludhiana District",
    },
  };

  const currentAlert = demoAlerts[activeDemoLang];

  return (
    <section className="py-20 md:py-28 bg-pankh-paper border-b border-border/80">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Accessibility Features */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-200/80 text-stone-800 text-xs font-semibold">
              <Globe className="h-3.5 w-3.5 text-stone-700" />
              <span>Built for Dusty Hands & Sunlight</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl text-pankh-clay font-normal leading-tight">
              True Punjabi-first accessibility for real farmers in the shed.
            </h2>

            <p className="text-sm sm:text-base text-stone-700 font-sans leading-relaxed">
              Most software assumes an English-speaking office worker with fast Wi-Fi. Pankh is engineered for a poultry farmer standing inside an 80-meter shed with gloves on.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Mic2 className="h-5 w-5 text-amber-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-pankh-clay font-sans">
                    Punjabi & Hinglish Voice Input
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Speak your daily mortality counts and symptoms directly into the microphone. Voice transcription works seamlessly with regional Punjabi accents.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <Smartphone className="h-5 w-5 text-emerald-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-pankh-clay font-sans">
                    Large 48px+ Touch Targets & High Contrast
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    High contrast ratios ensure full readability even under direct mid-day sun, with oversized buttons for rapid one-handed tapping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <WifiOff className="h-5 w-5 text-blue-800" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-pankh-clay font-sans">
                    Guaranteed Offline Draft Retention
                  </h4>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    Network drop in the rural fields? No data is ever lost. Every health log and expense entry persists locally and syncs automatically when network reconnects.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 4-Language Live Alert Card Demo */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-stone-300 bg-white p-6 sm:p-7 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Interactive Language Preview
                </span>

                {/* 4 Interactive Buttons */}
                <div className="inline-flex rounded-lg bg-stone-100 p-1 border border-stone-200" role="group">
                  {(
                    [
                      { code: "pa", label: "ਪੰਜਾਬੀ" },
                      { code: "en", label: "English" },
                      { code: "hi", label: "हिन्दी" },
                      { code: "hinglish", label: "Hinglish" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.code}
                      type="button"
                      onClick={() => setActiveDemoLang(opt.code)}
                      className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all min-h-[36px] ${
                        activeDemoLang === opt.code
                          ? "bg-white text-pankh-clay font-semibold shadow-xs"
                          : "text-stone-600 hover:text-stone-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Alert Preview Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeDemoLang}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-amber-300 bg-amber-50/60 p-5 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-mono text-[11px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-600" />
                      Live Sentinel Dispatch
                    </span>
                    <span className="text-[11px] font-mono text-stone-500">
                      {currentAlert.source}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg text-stone-900 font-medium">
                    {currentAlert.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans">
                    {currentAlert.body}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-amber-200/60 text-xs text-amber-950 font-medium">
                    <Volume2 className="h-4 w-4 text-amber-700 shrink-0" />
                    <span className="italic">{currentAlert.audioPrompt}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="text-[11px] text-stone-500 text-center font-sans">
                Try switching languages above — Pankh renders native Punjabi script and conversational Hinglish without distorted formatting.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
