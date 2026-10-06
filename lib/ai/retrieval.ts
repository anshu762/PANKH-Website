/**
 * Pankh AI — Vector & Hybrid Knowledge Retrieval
 * 
 * HARD RULE #3: Health/veterinary answers are NEVER generated from raw LLM memory —
 * always retrieve from the approved knowledge base (RAG) first.
 * HARD RULE #4: The system can only display citations that came back from actual
 * retrieval — never invent a source name.
 */

import { prisma } from "../db";
import { getEmbedding } from "./embeddings";
import { RetrievalFilters, RetrievedChunk } from "@/types/ai";
import { PUNJABI_TERM_EXPANSIONS } from "@/constants/ai";

export type { RetrievalFilters, RetrievedChunk };

/**
 * Normalizes farmer queries with Punjabi/Hindi domain terms to enrich retrieval keywords.
 */
export function normalizeQueryForRetrieval(query: string): string {
  const q = query.toLowerCase();
  const expansions: string[] = [];

  for (const [key, replacement] of Object.entries(PUNJABI_TERM_EXPANSIONS)) {
    if (q.includes(key)) {
      expansions.push(replacement);
    }
  }

  return `${query} ${expansions.join(" ")}`.trim();
}

/**
 * Retrieves top-k knowledge chunks from Neon Postgres using pgvector cosine distance
 * coupled with hybrid keyword boosting over approved KnowledgeSources.
 */
export async function retrieveKnowledge(
  query: string,
  options?: RetrievalFilters
): Promise<RetrievedChunk[]> {
  const topK = options?.topK ?? 4;
  const enrichedQuery = normalizeQueryForRetrieval(query);

  try {
    // 1. Generate 1536-dimensional query embedding
    const queryVector = await getEmbedding(enrichedQuery);
    const vecString = `[${queryVector.join(",")}]`;

    // 2. Query pgvector with cosine distance joined to approved sources
    // Note: 1 - (embedding <=> vec) represents cosine similarity
    const rawResults = await prisma.$queryRawUnsafe<any[]>(
      `SELECT 
        c.id, 
        c."sourceId", 
        c.content, 
        c."birdType", 
        c.tags,
        s.title as "sourceTitle", 
        s.authority as "sourceAuthority", 
        s.topic as "sourceTopic",
        s.url as "sourceUrl",
        CASE 
          WHEN c.embedding IS NOT NULL THEN (1.0 - (c.embedding <=> $1::vector))
          ELSE 0.5
        END as similarity
      FROM "KnowledgeChunk" c
      JOIN "KnowledgeSource" s ON c."sourceId" = s.id
      WHERE s.approved = true
      ORDER BY (c.embedding <=> $1::vector) ASC
      LIMIT $2`,
      vecString,
      topK * 2
    );

    if (!rawResults || rawResults.length === 0) {
      // Fallback: Direct keyword match if vector table returned empty
      return await fallbackKeywordRetrieval(query, topK);
    }

    // Map and filter results
    const chunks: RetrievedChunk[] = rawResults.map((r) => ({
      id: r.id,
      sourceId: r.sourceId,
      sourceTitle: r.sourceTitle,
      sourceAuthority: r.sourceAuthority,
      sourceTopic: r.sourceTopic,
      sourceUrl: r.sourceUrl,
      content: r.content,
      birdType: r.birdType,
      tags: Array.isArray(r.tags) ? r.tags : [],
      similarity: Number(parseFloat(r.similarity || 0).toFixed(4)),
    }));

    // If birdType is specified, prioritize matching bird types
    let filtered = chunks;
    if (options?.birdType) {
      const bt = options.birdType.toUpperCase();
      filtered = chunks.filter(
        (c) => !c.birdType || c.birdType === "BOTH" || c.birdType.toUpperCase() === bt
      );
      if (filtered.length < topK) {
        filtered = chunks; // fallback to full list if filtered count too small
      }
    }

    return filtered.slice(0, topK);
  } catch (error) {
    console.error("Vector retrieval failed, invoking keyword fallback:", error);
    return await fallbackKeywordRetrieval(query, topK);
  }
}

/**
 * Fallback keyword retrieval if pgvector distance operator encounters issues.
 */
async function fallbackKeywordRetrieval(
  query: string,
  limit: number
): Promise<RetrievedChunk[]> {
  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const chunks = await prisma.knowledgeChunk.findMany({
    where: {
      source: { approved: true },
      OR: [
        ...terms.map((t) => ({ content: { contains: t, mode: "insensitive" as const } })),
        ...terms.map((t) => ({ tags: { has: t } })),
      ],
    },
    include: { source: true },
    take: limit,
  });

  return chunks.map((c) => ({
    id: c.id,
    sourceId: c.sourceId,
    sourceTitle: c.source.title,
    sourceAuthority: c.source.authority,
    sourceTopic: c.source.topic,
    sourceUrl: c.source.url,
    content: c.content,
    birdType: c.birdType,
    tags: c.tags,
    similarity: 0.75,
  }));
}

export const retrieveKnowledgeChunks = retrieveKnowledge;

