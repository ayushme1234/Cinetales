/**
 * Groq client for Llama 3.3 70B inference.
 *
 * Free tier (as of 2026):
 *   - 14,400 requests/day
 *   - 30 requests/minute
 *   - Llama 3.3 70B Versatile + Llama 3.1 8B Instant
 *
 * Get your free API key: https://console.groq.com
 */

const GROQ_BASE = "https://api.groq.com/openai/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

export async function groq(messages: ChatMessage[], opts: GroqOptions = {}): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || "llama-3.3-70b-versatile",
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 1024,
      ...(opts.response_format ? { response_format: opts.response_format } : {}),
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Groq ${res.status}: ${txt}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Streaming variant — yields text chunks as Llama produces them.
 * Used for chat experience.
 */
export async function* groqStream(
  messages: ChatMessage[],
  opts: GroqOptions = {}
): AsyncGenerator<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set");

  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model || "llama-3.3-70b-versatile",
      messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.max_tokens ?? 1024,
      stream: true,
    }),
  });

  if (!res.ok || !res.body) {
    throw new Error(`Groq ${res.status}: ${await res.text()}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const json = JSON.parse(payload);
        const delta = json.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // ignore malformed chunks
      }
    }
  }
}

/**
 * Safely parse a JSON response from Llama — Llama sometimes wraps JSON in
 * markdown fences or adds preamble. This strips it.
 */
export function safeParseJson<T = any>(raw: string): T | null {
  let s = raw.trim();
  // Strip ```json ... ``` fences
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "");
  // Find the first { and last } (or [ ... ])
  const firstBrace = Math.min(
    ...["{", "["].map((c) => {
      const i = s.indexOf(c);
      return i === -1 ? Infinity : i;
    })
  );
  if (firstBrace === Infinity) return null;
  s = s.slice(firstBrace);
  // Try parsing progressively shorter slices to handle trailing junk
  for (let end = s.length; end > 0; end--) {
    try {
      return JSON.parse(s.slice(0, end));
    } catch {
      // keep trying
    }
  }
  return null;
}
