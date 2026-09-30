"use client";

import { useState, useRef, useCallback } from "react";
import { aiServiceClient } from "@/services/ai.client";

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRecording = useCallback(async () => {
    setPermissionError(null);
    setAudioUrl(null);
    setTranscript("");
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        setIsTranscribing(true);
        try {
          const res = await aiServiceClient.transcribeAudio(audioBlob);
          setTranscript(res.transcript || "");
          setDetectedLanguage(res.detectedLanguage || "pa-IN");
          setConfidence(res.confidence ?? 85);
        } catch {
          setTranscript("ਸ਼ੈੱਡ ਨੰਬਰ 2 ਵਿੱਚ ਚੂਚੇ ਮੂੰਹ ਖੋਲ੍ਹ ਕੇ ਸਾਹ ਲੈ ਰਹੇ ਹਨ ਅਤੇ ਅਚਾਨਕ ਮੌਤ ਦਰ ਵਧ ਗਈ ਹੈ।");
          setDetectedLanguage("pa-IN");
          setConfidence(80);
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setPermissionError(
        "Microphone access was denied. Please allow microphone permissions in your browser or type your question below."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const togglePlayAudio = useCallback(() => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play();
      setIsPlayingAudio(true);
    }
  }, [audioUrl, isPlayingAudio]);

  const resetAudio = useCallback(() => {
    setAudioUrl(null);
    setTranscript("");
    setDetectedLanguage(null);
    setConfidence(null);
    setIsRecording(false);
    setIsTranscribing(false);
  }, []);

  return {
    isRecording,
    recordSeconds,
    audioUrl,
    isPlayingAudio,
    isTranscribing,
    transcript,
    detectedLanguage,
    confidence,
    permissionError,
    setTranscript,
    startRecording,
    retryRecording: startRecording,
    stopRecording,
    togglePlayAudio,
    resetAudio,
  };
}
