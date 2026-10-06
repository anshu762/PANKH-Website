"use client";

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Mic, Camera, X, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSpeechAssistant } from "@/hooks/use-speech-assistant";
import { useLanguage } from "@/hooks/use-language";
import { VoiceAssistantOverlay } from "./voice-assistant-overlay";

interface ChatInputBarProps {
  value: string;
  onChange: (val: string) => void;
  onSend: (text: string, photoFile?: File) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInputBar({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "ਸਵਾਲ ਪੁੱਛੋ / Ask in Punjabi, Hindi, or English...",
}: ChatInputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { lang } = useLanguage();

  // Photo Attachment state
  const [attachedPhoto, setAttachedPhoto] = useState<{
    file: File;
    previewUrl: string;
    name: string;
  } | null>(null);

  // Automatically map user's selected platform language to speech recognition language
  const sttLanguage: "pa-IN" | "hi-IN" | "en-IN" =
    lang === "hi"
      ? "hi-IN"
      : lang === "en"
      ? "en-IN"
      : "pa-IN";

  // Premium Voice Assistant Hook (Live transcription + silence auto-stop + audio visualizer)
  const speechAssistant = useSpeechAssistant({
    language: sttLanguage,
    silenceTimeoutMs: 1800,
    onAutoStop: (finalText) => {
      if (finalText.trim()) {
        const combined = value.trim()
          ? `${value.trim()} ${finalText.trim()}`
          : finalText.trim();
        onChange(combined);
      }
    },
  });

  const {
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
    stopListening,
    cancelListening,
    toggleListening,
  } = speechAssistant;

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140
      )}px`;
    }
  }, [value]);

  // Clean up preview object URL on unmount or photo change
  useEffect(() => {
    return () => {
      if (attachedPhoto?.previewUrl) {
        URL.revokeObjectURL(attachedPhoto.previewUrl);
      }
    };
  }, [attachedPhoto]);

  // Handle image file selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Image is larger than 8MB. Please select a smaller photo.");
      return;
    }

    if (attachedPhoto?.previewUrl) {
      URL.revokeObjectURL(attachedPhoto.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setAttachedPhoto({
      file,
      previewUrl,
      name: file.name,
    });

    // Reset target value so selecting the same file again triggers change
    e.target.value = "";
  };

  const handleRemovePhoto = () => {
    if (attachedPhoto?.previewUrl) {
      URL.revokeObjectURL(attachedPhoto.previewUrl);
    }
    setAttachedPhoto(null);
  };

  // Direct Send from Voice Assistant Overlay
  const handleVoiceSend = (spokenText: string) => {
    stopListening();
    const finalMsg = value.trim()
      ? `${value.trim()} ${spokenText.trim()}`
      : spokenText.trim();
    if (!finalMsg && !attachedPhoto) return;

    onSend(finalMsg, attachedPhoto?.file);
    onChange("");

    if (attachedPhoto?.previewUrl) {
      URL.revokeObjectURL(attachedPhoto.previewUrl);
    }
    setAttachedPhoto(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Regular send button click
  const handleSend = () => {
    if (disabled) return;
    const trimmed = value.trim();
    if (!trimmed && !attachedPhoto) return;

    if (isListening) {
      stopListening();
    }

    onSend(trimmed, attachedPhoto?.file);
    onChange("");

    if (attachedPhoto?.previewUrl) {
      URL.revokeObjectURL(attachedPhoto.previewUrl);
    }
    setAttachedPhoto(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = Boolean(value.trim() || attachedPhoto);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2">
      {/* 1. Google Gemini / Siri Style Voice Assistant Overlay */}
      {(isListening || isTranscribing) && (
        <VoiceAssistantOverlay
          isListening={isListening}
          isSpeaking={isSpeaking}
          isTranscribing={isTranscribing}
          finalTranscript={finalTranscript}
          interimTranscript={interimTranscript}
          fullTranscript={fullTranscript}
          audioLevel={audioLevel}
          frequencyData={frequencyData}
          silenceProgress={silenceProgress}
          permissionError={permissionError}
          currentLanguage={lang}
          onStop={stopListening}
          onCancel={cancelListening}
          onSend={handleVoiceSend}
        />
      )}

      {/* 2. ChatGPT-style Smooth Input Pill Container */}
      <div className="bg-white rounded-3xl border border-stone-200/90 hover:border-stone-300 focus-within:border-stone-300 focus-within:shadow-md shadow-xs transition-all px-3 py-2 sm:px-4 sm:py-2.5 flex flex-col gap-2">
        {/* Attached Photo Preview Chip */}
        {attachedPhoto && (
          <div className="self-start inline-flex items-center gap-2.5 bg-stone-100/90 rounded-2xl p-1.5 pr-3 border border-stone-200/90 shadow-2xs animate-in fade-in duration-150">
            <img
              src={attachedPhoto.previewUrl}
              alt="Attached poultry photo"
              className="h-11 w-11 rounded-xl object-cover border border-stone-200"
            />
            <div className="flex flex-col min-w-0 pr-1">
              <span className="text-xs font-semibold text-stone-800 truncate max-w-[170px]">
                {attachedPhoto.name}
              </span>
              <span className="text-[10px] text-amber-700 font-medium">
                Photo attached • Click Send to analyze
              </span>
            </div>
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="h-6 w-6 rounded-full bg-stone-200/90 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
              title="Remove attached photo"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Input Row: Camera (Native Label), Mic, Textarea, Clear, Send */}
        <div className="flex items-end gap-2">
          {/* Left Actions: Native Camera Label & Mic Button */}
          <div className="flex items-center gap-1 pb-0.5">
            {/* Native Label-Wrapped Camera File Picker (100% Reliable across all browsers & OS) */}
            <label
              htmlFor="pankh-chat-camera-file"
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-colors cursor-pointer select-none",
                attachedPhoto
                  ? "bg-amber-100 text-amber-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100",
                (disabled || isListening) && "opacity-50 pointer-events-none"
              )}
              title="Attach photo of symptoms, feed, or droppings / ਫੋਟੋ ਅਪਲੋਡ"
              aria-label="Attach photo"
            >
              <Camera className="h-5 w-5" />
              <input
                id="pankh-chat-camera-file"
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                disabled={disabled || isListening}
                className="sr-only"
              />
            </label>

            {/* Instant-Activation Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              disabled={disabled}
              title={
                isListening
                  ? "Stop listening"
                  : "Speak in Punjabi, Hindi, or English / ਬੋਲ ਕੇ ਪੁੱਛੋ"
              }
              className={cn(
                "h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative",
                isListening
                  ? "bg-rose-500 text-white animate-pulse shadow-md ring-2 ring-rose-400/50"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              )}
              aria-label="Voice question"
            >
              {isListening ? (
                <Square className="h-4 w-4 fill-white" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Center: Main Textarea */}
          <div className="flex-1 relative flex items-center min-h-[38px]">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              rows={1}
              placeholder={
                isListening
                  ? "Listening above... Speak now / ਉੱਪਰ ਬੋਲੋ..."
                  : placeholder
              }
              className="w-full text-sm sm:text-base py-1 px-1 bg-transparent text-stone-900 placeholder:text-stone-400 border-none outline-none focus:outline-none focus:ring-0 resize-none leading-relaxed max-h-[140px]"
            />

            {value && !isListening && (
              <button
                type="button"
                onClick={() => onChange("")}
                className="text-stone-400 hover:text-stone-600 p-1 rounded-full hover:bg-stone-100 transition-colors shrink-0 cursor-pointer"
                title="Clear text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right Side: Circular Send Button */}
          <div className="pb-0.5">
            <button
              type="button"
              onClick={handleSend}
              disabled={disabled || !hasContent}
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer shadow-xs",
                hasContent
                  ? "bg-amber-600 hover:bg-amber-700 text-white active:scale-95 shadow-amber-600/20"
                  : "bg-stone-100 text-stone-300 cursor-not-allowed"
              )}
              aria-label="Send message"
            >
              <ArrowUp className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      {/* Subtle Bottom Helper Hint */}
      <div className="flex items-center justify-between px-3 text-[11px] text-stone-400">
        <span>ਪੰਜਾਬੀ, हिंदी, ਜਾਂ English ਵਿੱਚ ਬੋਲੋ ਜਾਂ ਲਿਖੋ</span>
        <span className="hidden sm:inline">Press Enter ↵ to send</span>
      </div>
    </div>
  );
}
