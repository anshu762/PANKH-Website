/**
 * Pankh AI — Unified LLM Client
 *
 * Supports:
 * 1. Google Gemini API direct (via GEMINI_API_KEY) — ultra low token cost / free-tier friendly.
 * 2. OpenRouter API (via OPENROUTER_API_KEY) with default model "google/gemini-2.0-flash-001".
 * 3. Graceful fallback to deterministic synthesis when keys are absent or network fails.
 */

export interface LlmCompletionOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export async function callLlm(options: LlmCompletionOptions): Promise<string | null> {
  const {
    systemPrompt,
    userPrompt,
    jsonMode = true,
    temperature = 0.2,
    maxTokens = 800,
  } = options;

  // Provider 1: Direct Google Gemini API (GEMINI_API_KEY)
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10 && !geminiKey.includes("xxxx")) {
    try {
      const geminiModel = process.env.GEMINI_MODEL || "gemini-2.0-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiKey}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userPrompt }],
            },
          ],
          generationConfig: {
            response_mime_type: jsonMode ? "application/json" : "text/plain",
            temperature,
            maxOutputTokens: maxTokens,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        console.warn(`[LLM Client] Gemini direct API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("[LLM Client] Gemini direct API call failed:", err);
    }
  }

  // Provider 2: OpenRouter API (Default model: Google Gemini 2.0 Flash)
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  if (openRouterKey && openRouterKey.trim().length > 10 && !openRouterKey.includes("xxxx")) {
    try {
      const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://pankh.app",
          "X-Title": "Pankh Poultry AI Assistant",
        },
        body: JSON.stringify({
          model,
          response_format: jsonMode ? { type: "json_object" } : undefined,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature,
          max_tokens: maxTokens,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) return content;
      } else {
        console.warn(`[LLM Client] OpenRouter API returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("[LLM Client] OpenRouter call failed:", err);
    }
  }

  return null;
}
