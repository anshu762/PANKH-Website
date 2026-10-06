"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { aiServiceClient } from "@/services/ai.client";

/**
 * Strips markdown symbols, asterisks, brackets, citation notes, and extra whitespace
 * so browser SpeechSynthesis reads natural sentences without reading symbols or glitching.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/[*#_~`>]/g, "") // strip markdown tokens
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // markdown links -> plain text
    .replace(/\b(?:Source|Based on|Authority):[^\n.]+/gi, "") // strip citation tags
    .replace(/\((?:[^)]+)\)/g, "") // strip technical parenthetical units
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Detects appropriate speech synthesis language code from text characters.
 */
function detectSpeechLanguage(text: string): "pa-IN" | "hi-IN" | "en-IN" {
  if (/[\u0A00-\u0A7F]/.test(text)) return "pa-IN";
  if (/[\u0900-\u097F]/.test(text)) return "hi-IN";

  // Check if Latin text contains common Hindi poultry terms
  const hindiLatinPattern =
    /\b(?:aap|aapke|kisan|murgi|murgiyo|chooje|chooja|daana|dana|paani|pani|bimaar|bimari|dawai|karein|kare|hai|hain|nahi|zaroori|aur|dhyan|rakhein|lakshan|doctor)\b/i;
  if (hindiLatinPattern.test(text)) {
    return "hi-IN";
  }

  return "en-IN";
}

/**
 * Finds the highest-fidelity natural Indian voice installed on the user's OS/browser.
 */
function selectOptimalVoice(targetLang: "pa-IN" | "hi-IN" | "en-IN"): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Exact language match
  const exact = voices.find((v) => v.lang.toLowerCase() === targetLang.toLowerCase());
  if (exact) return exact;

  // 2. Specialized Indian Voices on Windows / Chrome
  if (targetLang === "pa-IN") {
    const paVoice = voices.find((v) => v.lang.toLowerCase().startsWith("pa"));
    if (paVoice) return paVoice;
    // Fallback: Hindi/Indian voice has native Indic phonetic engine
    const hiVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith("hi") ||
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("india")
    );
    if (hiVoice) return hiVoice;
  }

  if (targetLang === "hi-IN") {
    const hiVoice = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
    if (hiVoice) return hiVoice;
    const inVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("india") ||
        v.name.toLowerCase().includes("ravi")
    );
    if (inVoice) return inVoice;
  }

  if (targetLang === "en-IN") {
    const enInVoice = voices.find(
      (v) =>
        v.lang.toLowerCase() === "en-in" ||
        v.name.toLowerCase().includes("heera") ||
        v.name.toLowerCase().includes("india")
    );
    if (enInVoice) return enInVoice;
    const enVoice = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
    if (enVoice) return enVoice;
  }

  return voices.find((v) => v.default) || voices[0] || null;
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Pre-load voices on client
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
      };
    }
  }, []);

  const playAnswerAudio = useCallback(async (text: string) => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    const cleanText = cleanTextForSpeech(text);
    if (!cleanText) return;

    setIsPlaying(true);
    try {
      // 1. Try Google Cloud TTS endpoint first
      const { audioBlob, fallbackToBrowser, suggestedLang } =
        await aiServiceClient.synthesizeSpeech(cleanText);

      if (audioBlob) {
        const url = URL.createObjectURL(audioBlob);
        const audio = new Audio(url);
        audio.onended = () => setIsPlaying(false);
        audio.onerror = () => setIsPlaying(false);
        audioRef.current = audio;
        await audio.play();
        return;
      }

      // 2. High-fidelity browser speech synthesis fallback
      if (fallbackToBrowser && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();

        const targetLang =
          (suggestedLang as "pa-IN" | "hi-IN" | "en-IN") || detectSpeechLanguage(cleanText);
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voice = selectOptimalVoice(targetLang);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = targetLang;
        }

        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = (e) => {
          console.warn("SpeechSynthesis error:", e);
          setIsPlaying(false);
        };

        window.speechSynthesis.speak(utterance);
        return;
      }
    } catch (err) {
      console.error("Audio playback error:", err);
    }
    setIsPlaying(false);
  }, [isPlaying]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, [stopAudio]);

  return {
    isPlaying,
    playAnswerAudio,
    stopAudio,
  };
}
