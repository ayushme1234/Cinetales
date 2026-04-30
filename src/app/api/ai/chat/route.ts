import { groqStream } from "@/lib/groq";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST { title: string, mediaType: "movie" | "tv", year?: string, overview?: string,
 *        history?: { role: "user" | "assistant"; content: string }[],
 *        message: string }
 * Streams plain-text response chunks (SSE-style).
 */
export async function POST(req: Request) {
  const { title, mediaType, year, overview, history, message } = await req.json();

  if (!title || !message) {
    return new Response("title and message required", { status: 400 });
  }
  if (typeof message !== "string" || message.length > 1000) {
    return new Response("message too long", { status: 400 });
  }

  const sys = `You are CineTales' movie expert AI. The user is browsing "${title}"${year ? ` (${year})` : ""} (${mediaType === "tv" ? "TV series" : "film"}). Answer their questions about the title.
Style:
- Friendly, casual, Gen Z tone but actually informative.
- Avoid spoilers UNLESS the user explicitly asks for them. If you're about to spoil, prefix the spoiler section with "🚨 spoiler:" so the user can stop reading.
- Keep answers concise (2-4 sentences usually). Longer only if the question genuinely needs it.
- If the user asks about something unrelated to film/TV, gently steer back.
- If you don't know a specific detail, say so honestly — don't make things up.

${overview ? `Plot summary for context: ${overview}` : ""}`;

  const messages = [
    { role: "system" as const, content: sys },
    ...(Array.isArray(history) ? history.slice(-10) : []), // keep last 10 turns
    { role: "user" as const, content: message },
  ];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of groqStream(messages, { temperature: 0.7, max_tokens: 600 })) {
          controller.enqueue(encoder.encode(chunk));
        }
        controller.close();
      } catch (e: any) {
        controller.enqueue(encoder.encode(`\n\n[error: ${e?.message || "AI failed"}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
