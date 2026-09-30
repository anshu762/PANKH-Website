/**
 * Pankh AI — Core Domain Types
 * Centralized TypeScript definitions for the Pankh AI Assistant module.
 */

export type PankhIntent =
  | "health"
  | "feed"
  | "vaccine"
  | "hygiene"
  | "weather"
  | "economics"
  | "general_management"
  | "emergency"
  | "unrelated";

export interface RedFlagCheckInput {
  text: string;
  mortalityCount?: number;
  flockSize?: number;
  mortalityPercent?: number;
  waterDropPercent?: number;
  symptoms?: string[];
}

export interface RedFlagSignals {
  mortalitySpike: boolean;
  neurologicalSigns: boolean;
  severeRespiratory: boolean;
  waterIntakeDrop: boolean;
  rapidMultiSymptom: boolean;
}

export interface RedFlagResult {
  triggered: boolean;
  urgencyLevel: "CRITICAL" | "HIGH" | "NONE";
  reasons: string[];
  signals: RedFlagSignals;
}

export interface IntentClassificationResult {
  intent: PankhIntent;
  confidence: number;
  reasoning: string;
  isHealthRelated: boolean;
}

export interface RetrievalFilters {
  birdType?: string;
  region?: string;
  tags?: string[];
  topK?: number;
}

export interface RetrievedChunk {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceAuthority: string;
  sourceTopic: string;
  sourceUrl?: string | null;
  content: string;
  birdType?: string | null;
  tags: string[];
  similarity: number;
}

export interface SourceMeta {
  id: string;
  title: string;
  authority: string;
  url?: string | null;
  excerpt: string;
}

export interface AnswerPayload {
  answer: string;
  why: string[];
  whatToDo: string[];
  ask?: string[];
  escalate: boolean;
  escalateReason?: string | null;
  sourceTitle: string;
  sourceAuthority?: string;
}

export interface StructuredAiAnswer extends AnswerPayload {
  retrievedChunkIds: string[];
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  inputMode: "TEXT" | "VOICE" | "PHOTO";
  structuredAnswer?: AnswerPayload;
  sources?: SourceMeta[];
  caseId?: string | null;
  alertId?: string | null;
  feedback?: string | null;
  createdAt: string;
}

export interface ChatApiResponse {
  conversationId: string;
  messageId: string;
  userMessageId: string;
  structuredAnswer: AnswerPayload;
  escalate: boolean;
  alertId?: string | null;
  caseId?: string | null;
  sources: SourceMeta[];
}

export interface PhotoAnalysisResponse {
  photoUrl?: string;
  observations: string[];
  followUpQuestions: string[];
  note?: string;
}

export interface TranscribeResponse {
  transcript: string;
  detectedLanguage?: string;
  confidence?: number;
  isSimulated?: boolean;
  note?: string;
}

export interface FeedbackResponse {
  success: boolean;
  messageId: string;
  feedback: string | null;
}

export interface AskPageInitialData {
  farmer: { id: string; name: string };
  activeBatch: { id: string; birdType: string; currentBirds: number } | null;
  recentConversationId: string | null;
  initialMessages: ChatMessage[];
}
