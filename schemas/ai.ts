/**
 * Pankh AI — Validation Schemas
 * Zod validation schemas shared between client and server for AI Assistant routes.
 */

import { z } from "zod";

export const chatInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message too long"),
  conversationId: z.string().cuid().optional().or(z.string().min(1).optional()),
  inputMode: z.enum(["TEXT", "VOICE", "PHOTO"]).default("TEXT"),
  batchId: z.string().cuid().optional().or(z.string().min(1).optional()),
});

export type ChatInput = z.infer<typeof chatInputSchema>;

export const feedbackInputSchema = z.object({
  messageId: z.string().min(1, "Message ID is required"),
  feedback: z.enum(["HELPFUL", "NOT_HELPFUL", "STILL_CONTINUING"]),
  comment: z.string().max(500, "Comment too long").optional(),
});

export type FeedbackInput = z.infer<typeof feedbackInputSchema>;

export const ttsInputSchema = z.object({
  text: z.string().min(1, "Text is required for audio playback").max(1200),
  language: z.string().default("pa-IN").optional(),
});

export type TtsInput = z.infer<typeof ttsInputSchema>;
