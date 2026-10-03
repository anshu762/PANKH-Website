"use client";

import React from "react";
import { Mic, Square, Play, Pause, Send, Edit3, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useVoiceRecorder } from "@/hooks/use-voice-recorder";

interface VoiceRecorderTabProps {
  onSendTranscript: (transcript: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export function VoiceRecorderTab({ onSendTranscript, isLoading, onCancel }: VoiceRecorderTabProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  const {
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
    retryRecording,
    stopRecording,
    togglePlayAudio,
    resetAudio,
  } = useVoiceRecorder();

  const handleSend = () => {
    if (!transcript.trim()) return;
    onSendTranscript(transcript.trim());
    resetAudio();
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-base font-bold text-pankh-clay">
            {dict.tabVoice}
          </h3>
          <p className="text-[11px] text-stone-500">
            Speak in Punjabi, Hindi, or mixed Hinglish. Review before submitting.
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-2.5 py-1 text-xs text-stone-600 hover:text-stone-900 rounded-lg bg-stone-100 hover:bg-stone-200 transition-colors font-medium cursor-pointer"
          >
            ← Back to Text
          </button>
        )}
      </div>

      {permissionError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{permissionError}</span>
          </div>
          <button
            type="button"
            onClick={retryRecording}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 transition-colors shadow-2xs"
          >
            Retry Mic Access
          </button>
        </div>
      )}

      {/* Main Mic Button & Visualizer */}
      <div className="flex flex-col items-center justify-center space-y-4 py-4">
        {isRecording ? (
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping" />
            <button
              type="button"
              onClick={stopRecording}
              className="relative h-20 w-20 rounded-full bg-rose-600 text-white flex flex-col items-center justify-center shadow-lg transition-transform active:scale-95"
            >
              <Square className="h-7 w-7 fill-white" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={isTranscribing}
            className="h-20 w-20 rounded-full bg-amber-500 hover:bg-amber-600 text-white flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95 group"
          >
            <Mic className="h-8 w-8 group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* State Label & Timer */}
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
            {isRecording ? (
              <span className="text-rose-600 flex items-center gap-1.5 justify-center">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                {dict.voiceRecording} ({formatTime(recordSeconds)})
              </span>
            ) : isTranscribing ? (
              <span className="text-amber-700 flex items-center gap-1.5 justify-center">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Transcribing Punjabi speech...
              </span>
            ) : audioUrl ? (
              <span className="text-emerald-700">Audio recorded. Review below.</span>
            ) : (
              <span>{dict.voiceClickToRecord}</span>
            )}
          </span>
        </div>
      </div>

      {/* Audio Preview Controls */}
      {audioUrl && !isRecording && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={togglePlayAudio}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors min-h-[40px]"
          >
            {isPlayingAudio ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{isPlayingAudio ? "Pause Audio" : "Listen Back"}</span>
          </button>

          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors min-h-[40px]"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Re-record</span>
          </button>
        </div>
      )}

      {/* Mandatory Farmer Transcript Verification & Edit Box */}
      {(transcript || isTranscribing) && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300/80 space-y-3 animate-in fade-in">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-950">
              <Edit3 className="h-3.5 w-3.5 text-amber-700" />
              <span>{dict.voiceReviewTitle}</span>
              {detectedLanguage && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold lowercase">
                  {detectedLanguage === "pa-IN" ? "ਪੰਜਾਬੀ (pa-IN)" : "हिंदी / Hinglish"}
                  {confidence ? ` • ${confidence}% match` : ""}
                </span>
              )}
            </div>
            <span className="text-[10px] text-amber-800 font-medium italic">
              Never silently guesses — review and correct words before sending
            </span>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            disabled={isTranscribing}
            rows={3}
            placeholder={dict.voiceEditPlaceholder}
            className="w-full text-xs sm:text-sm p-3 rounded-lg border border-amber-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans resize-none leading-relaxed"
          />

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || isTranscribing || !transcript.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pankh-clay hover:bg-stone-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors min-h-[44px]"
            >
              <Send className="h-4 w-4" />
              <span>{dict.voiceSendVerified}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
