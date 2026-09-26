"use client";

import React, { useState, useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ChatMessage, AnswerPayload } from "@/types/ai";
import { useAiChat } from "@/hooks/use-ai-chat";
import { ChatHeader } from "./chat-header";
import { QuickPromptPills } from "./quick-prompt-pills";
import { ChatEmptyState } from "./chat-empty-state";
import { ChatUserMessage } from "./chat-user-message";
import { ChatThinkingIndicator } from "./chat-thinking-indicator";
import { ChatInputBar } from "./chat-input-bar";
import { AiAnswerCard } from "./ai-answer-card";
import { VoiceRecorderTab } from "./voice-recorder-tab";
import { PhotoAnalysisTab } from "./photo-analysis-tab";

export type { ChatMessage };

interface ChatContainerProps {
  initialConversationId?: string | null;
  initialMessages?: ChatMessage[];
  activeBatchId?: string | null;
  birdType?: string | null;
}

export function ChatContainer({
  initialConversationId,
  initialMessages = [],
  activeBatchId,
  birdType,
}: ChatContainerProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;
  const [activeTab, setActiveTab] = useState<"TEXT" | "VOICE" | "PHOTO">("TEXT");

  const {
    messages,
    isLoading,
    error,
    draftInput,
    updateDraft,
    sendMessage,
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

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[550px] max-w-4xl mx-auto">
      {/* 1. Header & Quick Prompts */}
      <div className="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs mb-4">
        <ChatHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          birdType={birdType}
        />

        {activeTab === "TEXT" && (
          <QuickPromptPills
            onSelectPrompt={(prompt) => sendMessage(prompt, "TEXT")}
            disabled={isLoading}
          />
        )}
      </div>

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 p-2 sm:p-3 scroll-smooth">
        {messages.length === 0 ? (
          <ChatEmptyState />
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
              <div key={msg.id} className="flex justify-start gap-2.5 items-start">
                <div className="h-8 w-8 rounded-full bg-amber-500/20 border border-amber-400 text-amber-800 flex items-center justify-center shrink-0 font-serif font-bold text-sm shadow-xs">
                  ਪੰ
                </div>
                <div className="flex-1 max-w-2xl">
                  <AiAnswerCard
                    messageId={msg.id}
                    answer={parsedAnswer}
                    sources={msg.sources}
                    caseId={msg.caseId}
                    alertId={msg.alertId}
                    initialFeedback={msg.feedback}
                    onAskFollowUp={(q) => sendMessage(q, "TEXT")}
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
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Modes */}
      <div className="pt-3">
        {activeTab === "TEXT" && (
          <ChatInputBar
            value={draftInput}
            onChange={updateDraft}
            onSend={(text) => sendMessage(text, "TEXT")}
            disabled={isLoading}
            placeholder={dict.inputPlaceholder}
            sendLabel={dict.sendButton}
          />
        )}

        {activeTab === "VOICE" && (
          <VoiceRecorderTab
            onSendTranscript={(transcript) => {
              sendMessage(transcript, "VOICE");
              setActiveTab("TEXT");
            }}
            isLoading={isLoading}
          />
        )}

        {activeTab === "PHOTO" && (
          <PhotoAnalysisTab
            onSendPhotoQuery={(query) => {
              sendMessage(query, "PHOTO");
              setActiveTab("TEXT");
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
