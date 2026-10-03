"use client";

import { useState, useEffect, useCallback } from "react";
import { ChatMessage, ChatApiResponse } from "@/types/ai";
import { aiServiceClient } from "@/services/ai.client";

interface UseAiChatOptions {
  initialConversationId?: string | null;
  initialMessages?: ChatMessage[];
  activeBatchId?: string | null;
}

export function useAiChat({
  initialConversationId,
  initialMessages = [],
  activeBatchId,
}: UseAiChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [conversationId, setConversationId] = useState<string | null>(
    initialConversationId || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftInput, setDraftInput] = useState("");

  // Restore draft from localStorage on mount (Hard Rule #7)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("pankh_ai_draft_query");
      if (saved) {
        setDraftInput(saved);
      }
    } catch {
      // LocalStorage access restricted
    }
  }, []);

  const updateDraft = useCallback((text: string) => {
    setDraftInput(text);
    try {
      localStorage.setItem("pankh_ai_draft_query", text);
    } catch {
      // Ignore
    }
  }, []);

  const clearDraft = useCallback(() => {
    setDraftInput("");
    try {
      localStorage.removeItem("pankh_ai_draft_query");
    } catch {
      // Ignore
    }
  }, []);

  const sendMessage = useCallback(
    async (queryText: string, mode: "TEXT" | "VOICE" | "PHOTO" = "TEXT") => {
      const text = queryText.trim();
      if (!text || isLoading) return;

      setError(null);
      const userMsgId = `temp-user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMsgId,
        role: "USER",
        content: text,
        inputMode: mode,
        createdAt: new Date().toISOString(),
      };

      setIsLoading(true);
      // Immediately display user message in the chat stream
      setMessages((prev) => [...prev, userMessage]);
      // Immediately clear the input draft so input box empties
      clearDraft();

      try {
        const data: ChatApiResponse = await aiServiceClient.sendChatMessage({
          message: text,
          conversationId: conversationId || undefined,
          inputMode: mode,
          batchId: activeBatchId || undefined,
        });

        if (data.conversationId) {
          setConversationId(data.conversationId);
        }

        const assistantMessage: ChatMessage = {
          id: data.messageId,
          role: "ASSISTANT",
          content: JSON.stringify(data.structuredAnswer),
          inputMode: mode,
          structuredAnswer: data.structuredAnswer,
          sources: data.sources || [],
          caseId: data.caseId || null,
          alertId: data.alertId || null,
          createdAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err: any) {
        console.error("useAiChat error:", err);
        // Rule #7: Preserve query in draft on network failure for retry
        updateDraft(text);
        setError(err.message || "Network issue. Your question was preserved. Tap to retry.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, conversationId, activeBatchId, clearDraft, updateDraft]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setConversationId(null);
    clearDraft();
    setError(null);
  }, [clearDraft]);

  return {
    messages,
    conversationId,
    isLoading,
    error,
    draftInput,
    updateDraft,
    sendMessage,
    clearChat,
    setError,
  };
}
