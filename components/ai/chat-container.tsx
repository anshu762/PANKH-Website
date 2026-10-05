"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ChatMessage, AnswerPayload } from "@/types/ai";
import { useAiChat } from "@/hooks/use-ai-chat";
import { aiServiceClient } from "@/services/ai.client";
import { ChatHeader } from "./chat-header";
import { QuickPromptPills } from "./quick-prompt-pills";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatUserMessage } from "./chat-user-message";
import { ChatThinkingIndicator } from "./chat-thinking-indicator";
import { ChatInputBar } from "./chat-input-bar";
import { AiAnswerCard } from "./ai-answer-card";

export type { ChatMessage };

interface ChatContainerProps {
  initialConversationId?: string | null;
  initialMessages?: ChatMessage[];
  activeBatchId?: string | null;
  birdType?: string | null;
  farmerName?: string;
}

export function ChatContainer({
  initialConversationId,
  initialMessages = [],
  activeBatchId,
  birdType,
  farmerName,
}: ChatContainerProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;

  const {
    messages,
    isLoading,
    error,
    draftInput,
    updateDraft,
    sendMessage,
    clearChat,
  } = useAiChat({
    initialConversationId,
    initialMessages,
    activeBatchId,
  });

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Unified send handler supporting text, voice dictation, and attached photos
  const handleSend = async (text: string, photoFile?: File) => {
    if (photoFile) {
      try {
        const res = await aiServiceClient.analyzePhoto(photoFile);
        const obs =
          res.observations && res.observations.length > 0
            ? res.observations.join("; ")
            : "Visible physical poultry features captured";
        const followUps =
          res.followUpQuestions && res.followUpQuestions.length > 0
            ? res.followUpQuestions.join("; ")
            : "";

        const composedMessage = text.trim()
          ? `${text.trim()}\n\n[Photo Attached - Visible Observation]:\n• Features: ${obs}${
              followUps ? `\n• Key Checkpoints: ${followUps}` : ""
            }`
          : `[Photo Attached - Visible Observation]:\n• Features: ${obs}${
              followUps ? `\n• Key Checkpoints: ${followUps}` : ""
            }\n\nPlease provide guidance based on verified poultry protocols.`;

        sendMessage(composedMessage, "PHOTO");
      } catch (err) {
        console.warn("Photo analysis fallback:", err);
        sendMessage(
          text.trim() || "[Photo Attached]: Please check my poultry flock symptoms.",
          "PHOTO"
        );
      }
    } else {
      sendMessage(text, "TEXT");
    }
  };

  return (
    <div className="w-full max-w-5xl xl:max-w-6xl mx-auto flex flex-col h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-130px)] min-h-0 md:min-h-[580px] bg-white rounded-3xl border border-stone-200/90 shadow-sm overflow-hidden overflow-x-hidden">
      {/* 1. Header (Clean Bot Identity + Active Batch + New Chat) */}
      <div className="px-4 py-3 sm:px-6 sm:py-3.5 bg-white shrink-0">
        <ChatHeader
          onClearChat={clearChat}
          hasMessages={messages.length > 0}
          birdType={birdType}
        />
      </div>

      {/* 2. Spacious Message Feed */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6 space-y-5 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <ChatEmptyState
            onSelectPrompt={(prompt) => handleSend(prompt)}
            disabled={isLoading}
            farmerName={farmerName}
          />
        ) : (
          messages.map((msg) => {
            if (msg.role === "USER") {
              return (
                <ChatUserMessage
                  key={msg.id}
                  content={msg.content}
                  inputMode={msg.inputMode}
                />
              );
            }

            let parsedAnswer: AnswerPayload;
            try {
              parsedAnswer =
                msg.structuredAnswer || (JSON.parse(msg.content) as AnswerPayload);
            } catch {
              parsedAnswer = {
                answer: msg.content,
                why: [],
                whatToDo: [],
                escalate: false,
                sourceTitle: "Approved Poultry Knowledge Base",
              };
            }

            return (
              <div
                key={msg.id}
                className="flex justify-start gap-3 items-start animate-in fade-in duration-200"
              >
                <div className="h-9 w-9 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-800 flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-2xs mt-1">
                  ਪੰ
                </div>
                <div className="flex-1 max-w-4xl">
                  <AiAnswerCard
                    messageId={msg.id}
                    answer={parsedAnswer}
                    sources={msg.sources}
                    caseId={msg.caseId}
                    alertId={msg.alertId}
                    initialFeedback={msg.feedback}
                    onAskFollowUp={(prompt) => handleSend(prompt)}
                  />
                </div>
              </div>
            );
          })
        )}

        {isLoading && (
          <ChatThinkingIndicator message={dict.thinkingMessage} />
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
            {draftInput && (
              <button
                type="button"
                onClick={() => handleSend(draftInput)}
                className="px-3 py-1.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors flex items-center gap-1.5 shrink-0 text-xs cursor-pointer shadow-2xs"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Seamless Area */}
      <div className="px-3 py-3 sm:px-6 sm:py-4 bg-white shrink-0 space-y-2.5 overflow-x-hidden">
        {/* Quick follow-up pills when chat is ongoing */}
        {messages.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <QuickPromptPills
              onSelectPrompt={(prompt) => handleSend(prompt)}
              disabled={isLoading}
            />
          </div>
        )}

        {/* ChatGPT-style Modern Inline Input Bar */}
        <ChatInputBar
          value={draftInput}
          onChange={updateDraft}
          onSend={handleSend}
          disabled={isLoading}
          placeholder={dict.inputPlaceholder}
        />
      </div>
    </div>
  );
}
