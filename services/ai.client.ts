/**
 * Pankh AI — Client API Service
 * Centralizes all client-to-server API calls for the AI Assistant.
 * Components interact exclusively with this service layer instead of raw fetch calls.
 */

import {
  ChatApiResponse,
  PhotoAnalysisResponse,
  TranscribeResponse,
  FeedbackResponse,
} from "@/types/ai";
import { ChatInput, FeedbackInput } from "@/schemas/ai";

class AiServiceClient {
  /**
   * Sends farmer question to the AI chat orchestration pipeline.
   */
  async sendChatMessage(input: ChatInput): Promise<ChatApiResponse> {
    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to process chat message.");
    }

    return await res.json();
  }

  /**
   * Uploads recorded audio blob for speech-to-text transcription.
   */
  async transcribeAudio(audioBlob: Blob): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append("audio", audioBlob, "voice-query.webm");

    const res = await fetch("/api/ai/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to transcribe audio.");
    }

    return await res.json();
  }

  /**
   * Synthesizes text into spoken Punjabi audio.
   */
  async synthesizeSpeech(
    text: string
  ): Promise<{ audioBlob?: Blob; fallbackToBrowser?: boolean; suggestedLang?: string }> {
    const res = await fetch("/api/ai/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!res.ok) {
      return { fallbackToBrowser: true };
    }

    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("audio")) {
      const blob = await res.blob();
      return { audioBlob: blob };
    }

    const data = await res.json();
    return {
      fallbackToBrowser: !!data.fallbackToBrowser,
      suggestedLang: data.suggestedLang,
    };
  }

  /**
   * Uploads poultry photo for visible feature inspection (NO disease diagnosis).
   */
  async analyzePhoto(photoFile: File): Promise<PhotoAnalysisResponse> {
    const formData = new FormData();
    formData.append("photo", photoFile);

    const res = await fetch("/api/ai/analyze-photo", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to analyze photo.");
    }

    return await res.json();
  }

  /**
   * Submits user feedback (Helpful / Not Helpful / Still Continuing) on an AI answer.
   */
  async submitFeedback(input: FeedbackInput): Promise<FeedbackResponse> {
    const res = await fetch("/api/ai/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to record feedback.");
    }

    return await res.json();
  }
}

export const aiServiceClient = new AiServiceClient();
