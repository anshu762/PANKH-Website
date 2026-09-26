"use client";

import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";
import { AnswerPayload, SourceMeta } from "@/types/ai";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { AnswerStepDirect } from "./answer-step-direct";
import { AnswerStepWhy } from "./answer-step-why";
import { AnswerStepActions } from "./answer-step-actions";
import { AnswerStepAsk } from "./answer-step-ask";
import { AnswerStepEscalate } from "./answer-step-escalate";
import { AnswerStepSource } from "./answer-step-source";
import { AnswerFeedbackRow } from "./answer-feedback-row";

export type { AnswerPayload, SourceMeta };

interface AiAnswerCardProps {
  messageId: string;
  answer: AnswerPayload;
  sources?: SourceMeta[];
  caseId?: string | null;
  alertId?: string | null;
  initialFeedback?: string | null;
  onAskFollowUp?: (question: string) => void;
}

export function AiAnswerCard({
  messageId,
  answer,
  sources = [],
  caseId,
  initialFeedback,
  onAskFollowUp,
}: AiAnswerCardProps) {
  const { t } = useLanguage();
  const dict = t.aiAssistant;
  const { isPlaying, playAnswerAudio } = useAudioPlayer();

  const handleToggleAudio = () => {
    const speechText = `${answer.answer}. ${answer.whatToDo.join(". ")}`;
    playAnswerAudio(speechText);
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden text-pankh-clay font-sans transition-all">
      {/* 1. Header with Speaker button */}
      <div className="bg-stone-50/80 px-4 py-3 border-b border-stone-200/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold text-xs">
            ਪੰ
          </div>
          <span className="text-xs font-bold text-stone-700">Pankh AI • 6-Step Response</span>
        </div>

        <button
          type="button"
          onClick={handleToggleAudio}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all min-h-[36px]",
            isPlaying
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-stone-200/70 hover:bg-stone-200 text-stone-700"
          )}
          title="Listen in Punjabi"
        >
          {isPlaying ? (
            <>
              <VolumeX className="h-3.5 w-3.5 animate-pulse" />
              <span>Playing...</span>
            </>
          ) : (
            <>
              <Volume2 className="h-3.5 w-3.5 text-amber-700" />
              <span>ਸੁਣੋ (Listen)</span>
            </>
          )}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Step 1: Direct Answer */}
        <AnswerStepDirect label={dict.answerStepAnswer} answerText={answer.answer} />

        {/* Step 2: Why */}
        <AnswerStepWhy label={dict.answerStepWhy} points={answer.why} />

        {/* Step 3: What To Do Now */}
        <AnswerStepActions label={dict.answerStepWhatToDo} steps={answer.whatToDo} />

        {/* Step 4: Ask */}
        <AnswerStepAsk
          label={dict.answerStepAsk}
          questions={answer.ask}
          onSelectQuestion={onAskFollowUp}
        />

        {/* Step 5: Escalate */}
        {answer.escalate && (
          <AnswerStepEscalate
            label={dict.answerStepEscalate}
            reason={answer.escalateReason}
            caseId={caseId}
            buttonLabel={dict.answerContactVet}
          />
        )}

        {/* Step 6: Source */}
        <AnswerStepSource
          label={dict.answerBasedOn}
          sourceTitle={answer.sourceTitle}
          sourceAuthority={answer.sourceAuthority}
          sources={sources}
        />

        {/* Feedback Row */}
        <AnswerFeedbackRow
          messageId={messageId}
          initialFeedback={initialFeedback}
          labels={{
            helpful: dict.feedbackHelpful,
            notHelpful: dict.feedbackNotHelpful,
            continuing: dict.feedbackContinuing,
          }}
        />
      </div>
    </div>
  );
}
