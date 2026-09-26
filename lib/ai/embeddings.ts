/**
 * Pankh AI — Vector Embeddings Module
 * Generates 1536-dimensional vector embeddings for KnowledgeChunks and search queries.
 * Supports OpenRouter / OpenAI embeddings with a deterministic unit-sphere semantic
 * fallback when API keys are unconfigured.
 */

export const EMBEDDING_DIMENSION = 1536;

/**
 * Deterministic pseudo-random float generator from a string seed (Murmur-style hash).
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Deterministic semantic 1536-dimensional projection fallback.
 * Maps tokens and n-grams into a normalized 1536-dim vector on the unit hypersphere.
 * This guarantees consistent cosine distance search via pgvector in offline / dev environments.
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const vector = new Float64Array(EMBEDDING_DIMENSION);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 1);

  if (tokens.length === 0) {
    // Return unit vector along first dimension
    const emptyVec = new Array(EMBEDDING_DIMENSION).fill(0);
    emptyVec[0] = 1.0;
    return emptyVec;
  }

  // Domain-specific keyword weight boosts for poultry terms
  const poultryBoosts: Record<string, number> = {
    mortality: 3.0,
    death: 3.0,
    dead: 2.5,
    gasping: 3.5,
    respiratory: 3.0,
    torticollis: 4.0,
    neck: 3.0,
    twist: 3.0,
    ataxia: 3.5,
    paralysis: 3.5,
    vaccine: 3.0,
    vaccination: 3.0,
    lasota: 3.5,
    gumboro: 3.5,
    marek: 3.5,
    fcr: 3.0,
    feed: 2.5,
    water: 2.5,
    heat: 3.0,
    stress: 2.5,
    summer: 2.5,
    biosecurity: 3.0,
    disinfection: 3.0,
    chuna: 3.0,
    broiler: 2.5,
    layer: 2.5,
    chick: 2.0,
  };

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const weight = poultryBoosts[token] || 1.0;

    // Single token hash
    const h1 = Math.abs(hashString(token));
    const idx1 = h1 % EMBEDDING_DIMENSION;
    const sign1 = (h1 >> 16) % 2 === 0 ? 1 : -1;
    vector[idx1] += sign1 * weight;

    // Bi-gram hash if available
    if (i < tokens.length - 1) {
      const bigram = `${token}_${tokens[i + 1]}`;
      const h2 = Math.abs(hashString(bigram));
      const idx2 = h2 % EMBEDDING_DIMENSION;
      const sign2 = (h2 >> 16) % 2 === 0 ? 1 : -1;
      vector[idx2] += sign2 * weight * 1.5;
    }
  }

  // Normalize to L2 unit norm
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);

  if (norm === 0) {
    const emptyVec = new Array(EMBEDDING_DIMENSION).fill(0);
    emptyVec[0] = 1.0;
    return emptyVec;
  }

  const result: number[] = new Array(EMBEDDING_DIMENSION);
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    result[i] = Number((vector[i] / norm).toFixed(6));
  }

  return result;
}

/**
 * Retrieves embedding vector (1536-dim) for given text.
 * Attempts OpenRouter / OpenAI embeddings API if OPENROUTER_API_KEY is available;
 * otherwise uses deterministic semantic projection.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 10 && !apiKey.includes("xxxx")) {
    try {
      const endpoint = process.env.OPENAI_API_KEY
        ? "https://api.openai.com/v1/embeddings"
        : "https://openrouter.ai/api/v1/embeddings";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/text-embedding-3-small",
          input: text.slice(0, 8000),
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const embedding = json.data?.[0]?.embedding;
        if (Array.isArray(embedding) && embedding.length === EMBEDDING_DIMENSION) {
          return embedding;
        }
      }
    } catch {
      // Fallback to deterministic projection on network or API failure
    }
  }

  // Deterministic local projection
  return generateDeterministicEmbedding(text);
}
