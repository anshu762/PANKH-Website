"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { aiServiceClient } from "@/services/ai.client";

export interface SpeechAssistantOptions {
  language?: "pa-IN" | "hi-IN" | "en-IN";
  silenceTimeoutMs?: number;
  onAutoStop?: (finalText: string) => void;
  onLiveUpdate?: (fullText: string) => void;
}

export function useSpeechAssistant(options: SpeechAssistantOptions = {}) {
  const {
    language = "pa-IN",
    silenceTimeoutMs = 1800,
    onAutoStop,
    onLiveUpdate,
  } = options;

  const languageRef = useRef(language);
  languageRef.current = language;

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);
  const [frequencyData, setFrequencyData] = useState<number[]>([0.2, 0.35, 0.5, 0.35, 0.2]);
  const [silenceProgress, setSilenceProgress] = useState(0);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Active state ref to eliminate stale closures
  const activeRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Silence tracking refs
  const hasSpokenRef = useRef(false);
  const lastSpeechTimeRef = useRef<number>(0);
  const silenceIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoStopTriggeredRef = useRef(false);

  // Transcript refs
  const finalTranscriptRef = useRef("");
  finalTranscriptRef.current = finalTranscript;
  const interimTranscriptRef = useRef("");
  interimTranscriptRef.current = interimTranscript;

  const onAutoStopRef = useRef(onAutoStop);
  onAutoStopRef.current = onAutoStop;
  const onLiveUpdateRef = useRef(onLiveUpdate);
  onLiveUpdateRef.current = onLiveUpdate;

  // Cleanup Web Audio analyser
  const cleanupAudioAnalyser = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    analyserRef.current = null;
    setAudioLevel(0);
    setFrequencyData([0.2, 0.35, 0.5, 0.35, 0.2]);
  }, []);

  // Clear silence interval
  const clearSilenceTracking = useCallback(() => {
    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
      silenceIntervalRef.current = null;
    }
    setSilenceProgress(0);
    hasSpokenRef.current = false;
    autoStopTriggeredRef.current = false;
  }, []);

  // Stop listening and finalize
  const stopListening = useCallback(() => {
    activeRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    cleanupAudioAnalyser();
    clearSilenceTracking();
    setIsListening(false);
    setIsSpeaking(false);

    const fullText = (finalTranscriptRef.current + " " + interimTranscriptRef.current).trim();
    if (fullText) {
      setFinalTranscript(fullText);
      setInterimTranscript("");
      onAutoStopRef.current?.(fullText);
    }
  }, [cleanupAudioAnalyser, clearSilenceTracking]);

  // Cancel and discard
  const cancelListening = useCallback(() => {
    activeRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
      mediaRecorderRef.current = null;
    }

    cleanupAudioAnalyser();
    clearSilenceTracking();
    setIsListening(false);
    setIsSpeaking(false);
    setIsTranscribing(false);
    setFinalTranscript("");
    setInterimTranscript("");
  }, [cleanupAudioAnalyser, clearSilenceTracking]);

  // Start silence monitor
  const startSilenceMonitor = useCallback(() => {
    lastSpeechTimeRef.current = Date.now();
    hasSpokenRef.current = false;
    autoStopTriggeredRef.current = false;

    if (silenceIntervalRef.current) {
      clearInterval(silenceIntervalRef.current);
    }

    silenceIntervalRef.current = setInterval(() => {
      if (!activeRef.current) return;

      // Only count silence AFTER speech has started
      if (!hasSpokenRef.current) {
        setSilenceProgress(0);
        return;
      }

      const elapsed = Date.now() - lastSpeechTimeRef.current;
      const progress = Math.min(1, elapsed / silenceTimeoutMs);
      setSilenceProgress(progress);

      if (elapsed >= silenceTimeoutMs && !autoStopTriggeredRef.current) {
        autoStopTriggeredRef.current = true;
        stopListening();
      }
    }, 100);
  }, [silenceTimeoutMs, stopListening]);

  // Setup Web Audio Analyser in background (non-blocking)
  const setupBackgroundAnalyser = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!activeRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const tick = () => {
        if (!activeRef.current || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 120);
        setAudioLevel(normalized);

        const b1 = Math.max(0.15, (dataArray[1] || 0) / 255);
        const b2 = Math.max(0.2, (dataArray[3] || 0) / 255);
        const b3 = Math.max(0.3, (dataArray[6] || 0) / 255);
        const b4 = Math.max(0.2, (dataArray[9] || 0) / 255);
        const b5 = Math.max(0.15, (dataArray[12] || 0) / 255);
        setFrequencyData([b1, b2, b3, b4, b5]);

        const voiceActive = normalized > 0.08;
        setIsSpeaking(voiceActive);

        if (voiceActive) {
          hasSpokenRef.current = true;
          lastSpeechTimeRef.current = Date.now();
        }

        animationFrameRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (err: any) {
      console.warn("Background audio analyser note:", err.message);
    }
  }, []);

  // SYNCHRONOUS, INSTANT start listening handler
  const startListening = useCallback(() => {
    // 1. Immediately toggle UI state so overlay pops up instantly on click
    activeRef.current = true;
    setIsListening(true);
    setPermissionError(null);
    setFinalTranscript("");
    setInterimTranscript("");
    finalTranscriptRef.current = "";
    interimTranscriptRef.current = "";
    autoStopTriggeredRef.current = false;
    hasSpokenRef.current = false;

    // Start silence monitor immediately
    startSilenceMonitor();

    // 2. Start Web Speech API synchronously within user gesture
    const SpeechRecognitionClass =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = languageRef.current || "pa-IN";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let newlyFinalized = "";
          let currentInterim = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const res = event.results[i];
            const piece = res[0]?.transcript || "";
            if (res.isFinal) {
              newlyFinalized += piece + " ";
            } else {
              currentInterim += piece;
            }
          }

          if (newlyFinalized) {
            finalTranscriptRef.current = (
              finalTranscriptRef.current + " " + newlyFinalized
            ).trim();
            setFinalTranscript(finalTranscriptRef.current);
          }

          interimTranscriptRef.current = currentInterim.trim();
          setInterimTranscript(interimTranscriptRef.current);

          // Voice activity detected
          hasSpokenRef.current = true;
          lastSpeechTimeRef.current = Date.now();
          setSilenceProgress(0);
          setIsSpeaking(true);

          const combined = (
            finalTranscriptRef.current + " " + interimTranscriptRef.current
          ).trim();
          if (combined) {
            onLiveUpdateRef.current?.(combined);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn("SpeechRecognition event error:", event.error);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setPermissionError(
              "Microphone permission was denied. Please allow microphone access in your browser."
            );
          }
        };

        recognition.onend = () => {
          // If still active and not completed, restart or finalize
          if (activeRef.current && !autoStopTriggeredRef.current) {
            try {
              recognition.start();
            } catch {
              // Stopped normally
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;

        // 3. Connect audio visualizer in background (optional, doesn't block recognition)
        setupBackgroundAnalyser().catch(() => {});
        return;
      } catch (err: any) {
        console.warn("SpeechRecognition synchronous start error, falling back:", err);
      }
    }

    // 4. Fallback to MediaRecorder + server STT if Web Speech is unavailable
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          if (!activeRef.current) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }

          mediaStreamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              audioChunksRef.current.push(e.data);
            }
          };

          mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
            setIsTranscribing(true);
            try {
              const res = await aiServiceClient.transcribeAudio(audioBlob);
              if (res.transcript) {
                setFinalTranscript(res.transcript);
                onAutoStopRef.current?.(res.transcript);
              }
            } catch (err) {
              console.error("Transcribe API error:", err);
            } finally {
              setIsTranscribing(false);
            }
          };

          mediaRecorder.start(250);
          setupBackgroundAnalyser().catch(() => {});
        })
        .catch((err) => {
          console.error("MediaDevices error:", err);
          setPermissionError("Could not access microphone. Please allow permissions.");
        });
    } else {
      setPermissionError("Speech recognition is not supported in this browser.");
    }
  }, [language, setupBackgroundAnalyser, startSilenceMonitor]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (activeRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      activeRef.current = false;
      cleanupAudioAnalyser();
      clearSilenceTracking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, [cleanupAudioAnalyser, clearSilenceTracking]);

  const fullTranscript = (finalTranscript + " " + interimTranscript).trim();

  return {
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
    startListening,
    stopListening,
    cancelListening,
    toggleListening,
  };
}
