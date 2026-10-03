"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, RefreshCw, Send, CheckCircle2, HelpCircle, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { aiServiceClient } from "@/services/ai.client";

interface PhotoAnalysisTabProps {
  onSendPhotoQuery: (query: string, photoUrl?: string) => void;
  isLoading: boolean;
  onCancel?: () => void;
}

export function PhotoAnalysisTab({ onSendPhotoQuery, isLoading, onCancel }: PhotoAnalysisTabProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [observations, setObservations] = useState<string[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [remotePhotoUrl, setRemotePhotoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setObservations([]);
    setFollowUpQuestions([]);
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError("Image size exceeds 8MB. Please select a smaller photo.");
        return;
      }
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const analyzePhoto = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      const data = await aiServiceClient.analyzePhoto(selectedFile);
      setObservations(data.observations || []);
      setFollowUpQuestions(data.followUpQuestions || []);
      if (data.photoUrl) {
        setRemotePhotoUrl(data.photoUrl);
      }
    } catch (err: any) {
      console.error("Photo analysis error:", err);
      setError(err.message || "Failed to analyze photo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendToChat = () => {
    if (observations.length === 0) return;
    const synthesizedQuery = `[Photo Observation Review]:\n- Visible Features: ${observations.join("; ")}\n- Follow-up Context: ${followUpQuestions.join("; ")}\n\nPlease provide guidance based on verified poultry protocols.`;
    onSendPhotoQuery(synthesizedQuery, remotePhotoUrl || previewUrl || undefined);
    setSelectedFile(null);
    setPreviewUrl(null);
    setObservations([]);
    setFollowUpQuestions([]);
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-5 space-y-4">
      {/* Header Info */}
      <div className="flex items-center justify-between pb-2 border-b border-stone-100">
        <div>
          <h3 className="font-serif text-base font-bold text-pankh-clay">
            {dict.tabPhoto}
          </h3>
          <p className="text-[11px] text-stone-500 leading-relaxed">
            {dict.photoUploadSubtitle}
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

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Drop Zone / Camera Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-stone-50/50 hover:bg-amber-50/20 transition-all space-y-3"
        >
          <div className="h-14 w-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
            <Camera className="h-7 w-7" />
          </div>
          <div className="text-center space-y-1">
            <span className="text-xs sm:text-sm font-bold text-pankh-clay">
              Tap to take photo or choose from gallery
            </span>
            <p className="text-[11px] text-stone-500">JPG, PNG, or WebP up to 8MB</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative w-full max-w-xs mx-auto aspect-video rounded-xl overflow-hidden border border-stone-200 bg-black/5 shadow-xs">
            <img
              src={previewUrl}
              alt="Selected flock photo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={analyzePhoto}
              disabled={isAnalyzing}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors min-h-[44px]"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{dict.photoAnalyzing}</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Analyze Visible Features</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl(null);
                setObservations([]);
                setFollowUpQuestions([]);
              }}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors min-h-[44px]"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Observations & Clarifying Questions Result */}
      {observations.length > 0 && (
        <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-4 animate-in fade-in">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{dict.photoObservationsTitle}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-stone-700">
              {observations.map((obs, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-white p-2 rounded-lg border border-stone-200/60">
                  <span className="font-bold text-amber-600">•</span>
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          {followUpQuestions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-amber-600" />
                <span>{dict.photoQuestionsTitle}</span>
              </h4>
              <ul className="space-y-1 text-xs text-stone-600 italic">
                {followUpQuestions.map((q, idx) => (
                  <li key={idx} className="bg-white p-2 rounded-lg border border-stone-200/60">
                    “{q}”
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleSendToChat}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-pankh-clay hover:bg-stone-800 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-xs transition-colors min-h-[44px]"
            >
              <Send className="h-4 w-4" />
              <span>{dict.photoInsertToChat}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
