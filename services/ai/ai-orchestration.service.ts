/**
 * Pankh AI — Server Orchestration Service
 * Encapsulates full business logic for query processing, red flags,
 * RAG retrieval, LLM generation, and database mutations (Alerts/Cases).
 */

import { prisma } from "@/lib/db";
import { checkRedFlags } from "@/lib/ai/redFlags";
import { classifyIntent } from "@/lib/ai/router";
import { retrieveKnowledge } from "@/lib/ai/retrieval";
import { generateStructuredAnswer } from "@/lib/ai/generator";
import { AlertSeverity, CaseStatus, MessageRole, InputMode } from "@prisma/client";
import { ChatInput, FeedbackInput } from "@/schemas/ai";
import {
  ChatApiResponse,
  AskPageInitialData,
  AnswerPayload,
  ChatMessage,
  FeedbackResponse,
} from "@/types/ai";

export class AiOrchestrationService {
  /**
   * Processes a farmer query end-to-end according to AGENTS.md rules.
   */
  async processFarmerQuery(
    userId: string,
    input: ChatInput
  ): Promise<ChatApiResponse> {
    const { message, conversationId, inputMode, batchId: reqBatchId } = input;

    // 1. Resolve Farmer Profile & Active Batch
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        farms: {
          include: {
            batches: {
              where: { status: "ACTIVE" },
              take: 1,
            },
          },
        },
      },
    });

    if (!farmer) {
      throw new Error("Farmer profile not found. Please complete onboarding first.");
    }

    const activeBatch =
      (reqBatchId
        ? await prisma.batch.findUnique({ where: { id: reqBatchId } })
        : null) ||
      farmer.farms[0]?.batches[0] ||
      null;

    // 2. Deterministic Red-Flag Detection (MUST run before LLM)
    const redFlags = checkRedFlags({
      text: message,
      flockSize: activeBatch?.currentBirds,
    });

    // 3. Classify Intent
    const intentResult = await classifyIntent(message);

    // 4. Knowledge Base Retrieval (RAG)
    const retrievedChunks = await retrieveKnowledge(message, {
      birdType: activeBatch?.birdType,
      topK: 3,
    });

    // 5. Generate 6-Step Structured Response
    const structuredAnswer = await generateStructuredAnswer({
      query: message,
      intent: intentResult.intent,
      redFlags,
      retrievedChunks,
      birdType: activeBatch?.birdType,
    });

    // 6. Escalation: Create Alert (RED) and CaseRecord if red-flag triggered
    let alertRecord = null;
    let caseRecord = null;

    if (structuredAnswer.escalate && activeBatch) {
      alertRecord = await prisma.alert.create({
        data: {
          batchId: activeBatch.id,
          severity: AlertSeverity.RED,
          reason:
            structuredAnswer.escalateReason ||
            redFlags.reasons.join("; ") ||
            "Pankh AI detected high-risk poultry emergency",
          signalsTriggered: JSON.parse(
            JSON.stringify({
              reasons: redFlags.reasons,
              intent: intentResult.intent,
              query: message,
              signals: redFlags.signals,
            })
          ),
          escalated: true,
        },
      });

      caseRecord = await prisma.caseRecord.create({
        data: {
          farmerId: farmer.id,
          batchId: activeBatch.id,
          alertId: alertRecord.id,
          symptomsSummary: message.slice(0, 500),
          aiSummary: structuredAnswer.answer.slice(0, 500),
          status: CaseStatus.CREATED,
        },
      });
    }

    // 7. Resolve Conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, farmerId: farmer.id },
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          farmerId: farmer.id,
        },
      });
    }

    // 8. Store User & Assistant Messages
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.USER,
        content: message,
        inputMode: inputMode as InputMode,
        sourceIds: [],
      },
    });

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: MessageRole.ASSISTANT,
        content: JSON.stringify(structuredAnswer),
        inputMode: inputMode as InputMode,
        sourceIds: structuredAnswer.retrievedChunkIds,
      },
    });

    return {
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      userMessageId: userMessage.id,
      structuredAnswer,
      escalate: structuredAnswer.escalate,
      alertId: alertRecord?.id || null,
      caseId: caseRecord?.id || null,
      sources: retrievedChunks.map((c) => ({
        id: c.id,
        title: c.sourceTitle,
        authority: c.sourceAuthority,
        url: c.sourceUrl || null,
        excerpt: c.content.slice(0, 160) + "...",
      })),
    };
  }

  /**
   * Fetches initial conversational state and active flock context for the Ask page.
   */
  async getAskPageInitialData(userId: string): Promise<AskPageInitialData | null> {
    const farmer = await prisma.farmer.findUnique({
      where: { userId },
      include: {
        user: true,
        farms: {
          include: {
            batches: {
              where: { status: "ACTIVE" },
              take: 1,
            },
          },
        },
        conversations: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
              take: 30,
            },
          },
        },
      },
    });

    if (!farmer) return null;

    const activeBatch = farmer.farms[0]?.batches[0] || null;
    const recentConversation = farmer.conversations[0] || null;

    let initialMessages: ChatMessage[] = [];

    if (recentConversation && recentConversation.messages.length > 0) {
      const allSourceIds = recentConversation.messages.flatMap((m) => m.sourceIds);
      const uniqueChunkIds = Array.from(new Set(allSourceIds));

      const chunks =
        uniqueChunkIds.length > 0
          ? await prisma.knowledgeChunk.findMany({
              where: { id: { in: uniqueChunkIds } },
              include: { source: true },
            })
          : [];

      const chunkMap = new Map(
        chunks.map((c) => [
          c.id,
          {
            id: c.id,
            title: c.source.title,
            authority: c.source.authority,
            url: c.source.url,
            excerpt: c.content.slice(0, 160) + "...",
          },
        ])
      );

      initialMessages = recentConversation.messages.map((m) => {
        let structuredAnswer: AnswerPayload | undefined;
        if (m.role === "ASSISTANT") {
          try {
            structuredAnswer = JSON.parse(m.content) as AnswerPayload;
          } catch {
            structuredAnswer = {
              answer: m.content,
              why: [],
              whatToDo: [],
              escalate: false,
              sourceTitle: "Approved Veterinary Knowledge Base",
            };
          }
        }

        const sources = m.sourceIds.map((id) => chunkMap.get(id)).filter(Boolean) as any[];

        return {
          id: m.id,
          role: m.role as "USER" | "ASSISTANT",
          content: m.content,
          inputMode: m.inputMode as "TEXT" | "VOICE" | "PHOTO",
          structuredAnswer,
          sources,
          feedback: m.feedback,
          createdAt: m.createdAt.toISOString(),
        };
      });
    }

    return {
      farmer: { id: farmer.id, name: farmer.user?.name || "Farmer" },
      activeBatch: activeBatch
        ? {
            id: activeBatch.id,
            birdType: activeBatch.birdType,
            currentBirds: activeBatch.currentBirds,
          }
        : null,
      recentConversationId: recentConversation?.id || null,
      initialMessages,
    };
  }

  /**
   * Records farmer feedback on an AI response and creates an audit log for review if negative.
   */
  async recordFeedback(
    userId: string,
    input: FeedbackInput
  ): Promise<FeedbackResponse> {
    const { messageId, feedback, comment } = input;

    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    });

    if (!message) {
      throw new Error("Message not found");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { feedback },
    });

    if (feedback === "NOT_HELPFUL" || feedback === "STILL_CONTINUING") {
      await prisma.auditLog.create({
        data: {
          actorId: userId,
          action: "AI_FEEDBACK_NEGATIVE",
          entityType: "Message",
          entityId: messageId,
          metadata: {
            feedback,
            comment: comment || null,
            conversationId: message.conversationId,
            farmerId: message.conversation.farmerId,
            sourceIds: message.sourceIds,
            requiresAdminReview: true,
            status: "PENDING_REVIEW",
          },
        },
      });
    }

    return {
      success: true,
      messageId: updatedMessage.id,
      feedback: updatedMessage.feedback,
    };
  }
}

export const aiOrchestrationService = new AiOrchestrationService();
