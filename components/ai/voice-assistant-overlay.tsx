"use client";

import React from "react";
import { Square, X, Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SupportedLanguage } from "@/lib/i18n/types";

interface VoiceAssistantOverlayProps {
  isListening: boolean;
  isSpeaking: boolean;
  isTranscribing: boolean;
  finalTranscript: string;
  interimTranscript: string;
  fullTranscript: string;
  audioLevel: number;
  frequencyData: number[];
  silenceProgress: number;
  permissionError: string | null;
  currentLanguage?: SupportedLanguage;
  onStop: () => void;
  onCancel: () => void;
  onSend: (text: string) => void;
}

export function VoiceAssistantOverlay({
  isListening,
  isSpeaking,
  isTranscribing,
  finalTranscript,
  interimTranscript,
  fullTranscript,
  audioLevel,
  frequencyData,
  silenceProgress,
  permissionError,
  currentLanguage = "pa",
  onStop,
  onCancel,
  onSend,
}: VoiceAssistantOverlayProps) {
  if (!isListening && !isTranscribing) return null;

  const hasSpokenContent = Boolean(fullTranscript.trim());

  const handleSendClick = () => {
    if (!fullTranscript.trim()) return;
    onSend(fullTranscript.trim());
  };

  // 5 Google / Siri-style dynamic equalizer bars
  const barHeights =
    frequencyData && frequencyData.length >= 5
      ? frequencyData
      : [0.2, 0.35, 0.5, 0.35, 0.2];

  // Multilingual dynamic localized labels matching user's selected language
  const labels = {
    pa: {
      processing: "ਪ੍ਰੋਸੈਸਿੰਗ... / Processing audio...",
      hearing: "ਸੁਣ ਰਿਹਾ ਹੈ... / Hearing you...",
      pause: "ਪੌਜ਼ ਮਿਲਿਆ... / Pause detected...",
      listening: "ਸੁਣ ਰਿਹਾ ਹੈ... ਬੋਲੋ ਜੀ / Listening • Speak now",
      autoStopHint: "ਬੋਲਣਾ ਬੰਦ ਕਰਨ 'ਤੇ ਆਪਣੇ ਆਪ ਰੁਕ ਜਾਵੇਗਾ (Auto-stops when you pause)",
      pauseCompletingHint: "ਰੁਕਣ 'ਤੇ ਆਪਣੇ ਆਪ ਪੂਰਾ ਹੋ ਜਾਵੇਗਾ (Completing on pause...)",
      emptyPlaceholder: "ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ (ਜਿਵੇਂ: 'ਚੂਚਿਆਂ ਨੂੰ ਖੰਘ ਹੈ' ਜਾਂ 'FCR ਕਿਵੇਂ ਠੀਕ ਕਰੀਏ')...",
      cancel: "ਰੱਦ ਕਰੋ",
      done: "ਰੋਕੋ (Done)",
      send: "ਭੇਜੋ / Ask",
    },
    hi: {
      processing: "प्रोसेस हो रहा है... / Processing audio...",
      hearing: "सुन रहा है... / Hearing you...",
      pause: "पॉज़ मिला... / Pause detected...",
      listening: "सुन रहा है... बोलिए / Listening • Speak now",
      autoStopHint: "बोलना बंद करने पर अपने आप रुक जाएगा (Auto-stops when you pause)",
      pauseCompletingHint: "रुकने पर अपने आप पूरा हो जाएगा (Completing on pause...)",
      emptyPlaceholder: "बोलना शुरू करें (जैसे: 'चूजों को सांस लेने में तकलीफ़ है' या 'FCR कैसे ठीक करें')...",
      cancel: "रद्द करें",
      done: "रोकें (Done)",
      send: "भेजें / Ask",
    },
    hinglish: {
      processing: "Processing audio...",
      hearing: "Sun raha hai... / Hearing you...",
      pause: "Pause mila... / Completing...",
      listening: "Listening... Boliye",
      autoStopHint: "Bolna band karne par automatically ruk jayega",
      pauseCompletingHint: "Completing on pause...",
      emptyPlaceholder: "Bolna shuru karein (e.g. 'Chicks coughing issue' ya 'FCR advice')...",
      cancel: "Cancel",
      done: "Done",
      send: "Ask / Bhejo",
    },
    en: {
      processing: "Processing audio...",
      hearing: "Hearing your voice...",
      pause: "Pause detected • Completing...",
      listening: "Listening • Speak now",
      autoStopHint: "Auto-stops when you pause speaking",
      pauseCompletingHint: "Completing on pause...",
      emptyPlaceholder: "Start speaking (e.g. 'Chicks have respiratory distress' or 'How to improve FCR')...",
      cancel: "Cancel",
      done: "Done",
      send: "Ask Assistant",
    },
  }[currentLanguage] || {
    processing: "ਪ੍ਰੋਸੈਸਿੰਗ... / Processing audio...",
    hearing: "ਸੁਣ ਰਿਹਾ ਹੈ... / Hearing you...",
    pause: "ਪੌਜ਼ ਮਿਲਿਆ... / Pause detected...",
    listening: "ਸੁਣ ਰਿਹਾ ਹੈ... ਬੋਲੋ ਜੀ / Listening • Speak now",
    autoStopHint: "ਬੋਲਣਾ ਬੰਦ ਕਰਨ 'ਤੇ ਆਪਣੇ ਆਪ ਰੁਕ ਜਾਵੇਗਾ (Auto-stops when you pause)",
    pauseCompletingHint: "ਰੁਕਣ 'ਤੇ ਆਪਣੇ ਆਪ ਪੂਰਾ ਹੋ ਜਾਵੇਗਾ (Completing on pause...)",
    emptyPlaceholder: "ਬੋਲਣਾ ਸ਼ੁਰੂ ਕਰੋ (ਜਿਵੇਂ: 'ਚੂਚਿਆਂ ਨੂੰ ਖੰਘ ਹੈ')...",
    cancel: "ਰੱਦ ਕਰੋ",
    done: "ਰੋਕੋ (Done)",
    send: "ਭੇਜੋ / Ask",
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-amber-300/90 shadow-2xl p-5 sm:p-6 text-stone-900 transition-all animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* Ambient Fluid Warm Mustard / Sarson Glow (PANKH Agrarian Aesthetic) */}
      <div
        className={cn(
          "pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-44 w-80 rounded-full bg-gradient-to-b from-amber-400/25 via-yellow-200/15 to-transparent blur-3xl transition-opacity duration-300",
          isSpeaking ? "opacity-100 scale-125" : "opacity-60 scale-100"
        )}
      />

      {/* Top Header: Cancel Button & Voice Assistant Status (No horizontal line) */}
      <div className="relative flex items-center justify-between pb-2">
        {/* Left: Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/80 text-xs font-semibold text-amber-950 shadow-2xs">
          {isTranscribing ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-600" />
              <span>{labels.processing}</span>
            </>
          ) : isSpeaking ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-emerald-800 font-bold">{labels.hearing}</span>
            </>
          ) : silenceProgress > 0 ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <span className="text-amber-800 font-bold">{labels.pause}</span>
            </>
          ) : (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-pulse inline-flex h-full w-full rounded-full bg-amber-500"></span>
              </span>
              <span className="text-stone-700">{labels.listening}</span>
            </>
          )}
        </div>

        {/* Right: Sleek Cancel Button */}
        <button
          type="button"
          onClick={onCancel}
          title="Cancel"
          className="h-8 w-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Permission Error Banner */}
      {permissionError && (
        <div className="my-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
          {permissionError}
        </div>
      )}

      {/* Center: Radiant Sarson Gold Dynamic Equalizer Waveform */}
      <div className="relative py-4 flex flex-col items-center justify-center">
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 h-16 w-full">
          {barHeights.map((val, idx) => {
            const dynamicHeight = Math.max(
              8,
              Math.min(52, Math.round((val + audioLevel * 0.7) * 48))
            );
            return (
              <span
                key={idx}
                style={{
                  height: `${dynamicHeight}px`,
                  transition: "height 80ms cubic-bezier(0.4, 0, 0.2, 1)",
                }}
                className={cn(
                  "w-1.5 sm:w-2 rounded-full",
                  idx === 2
                    ? "bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-400 shadow-md shadow-amber-500/30"
                    : idx === 1 || idx === 3
                    ? "bg-gradient-to-t from-amber-500 to-amber-400"
                    : "bg-gradient-to-t from-amber-400 to-yellow-300 opacity-80"
                )}
              />
            );
          })}
        </div>

        {/* Subtle breathing indicator beneath the wave */}
        <span className="text-[11px] text-stone-500 mt-1.5 select-none font-medium text-center">
          {silenceProgress > 0 ? labels.pauseCompletingHint : labels.autoStopHint}
        </span>
      </div>

      {/* Real-time Spoken Text Area (PANKH Warm Light Theme) */}
      <div className="relative min-h-[72px] max-h-[160px] overflow-y-auto px-4 py-3 rounded-2xl bg-amber-50/50 border border-amber-200/70 shadow-inner flex flex-col justify-center my-2">
        {hasSpokenContent ? (
          <p className="text-stone-900 text-base sm:text-lg font-medium leading-relaxed break-words font-sans">
            {/* Confirmed text */}
            <span className="text-stone-950 font-semibold">{finalTranscript}</span>{" "}
            {/* Real-time streaming interim text */}
            {interimTranscript && (
              <span className="text-amber-950 font-bold bg-amber-100/90 px-2 py-0.5 rounded-lg border-b-2 border-amber-500">
                {interimTranscript}
                <span className="inline-block w-1.5 h-4 ml-1 bg-amber-600 rounded-full animate-pulse align-middle" />
              </span>
            )}
          </p>
        ) : (
          <div className="flex items-center justify-center gap-2 text-stone-400 text-xs sm:text-sm italic py-2 select-none">
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse shrink-0" />
            <span>{labels.emptyPlaceholder}</span>
          </div>
        )}
      </div>

      {/* Bottom Minimalist Controls (Light Theme) */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Discard / Close */}
        <button
          type="button"
          onClick={onCancel}
          className="min-h-[44px] px-4 py-2 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
        >
          {labels.cancel}
        </button>

        <div className="flex items-center gap-2.5">
          {/* Stop / Done Button */}
          <button
            type="button"
            onClick={onStop}
            className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs sm:text-sm font-semibold transition-all active:scale-95 cursor-pointer shadow-md"
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            <span>{labels.done}</span>
          </button>

          {/* Direct Send Spoken Question */}
          <button
            type="button"
            onClick={handleSendClick}
            disabled={!hasSpokenContent || isTranscribing}
            className={cn(
              "min-h-[44px] inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-white transition-all cursor-pointer shadow-lg",
              hasSpokenContent && !isTranscribing
                ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 active:scale-95 shadow-amber-500/25"
                : "bg-stone-200 text-stone-400 cursor-not-allowed opacity-60"
            )}
          >
            <Send className="h-4 w-4" />
            <span>{labels.send}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
