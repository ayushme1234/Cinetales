// CineTales — /api/ai-pitch
// Given a title + overview + genres, generate a 3-bullet, spoiler-free
// "Why watch this?" pitch via Groq. No login required.

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const { title, year, overview, genres = [], type = "movie" } = req.body || {};
  if (!title) return res.status(400).json({ error: "Missing title" });

  const sys = `You are a cinephile friend who pitches films and shows in a tight, conversational style. You produce exactly 3 short bullet pitches answering "Why watch this?" — each 1 sentence, max 18 words. NEVER include spoilers, plot resolutions, or twists. Focus on tone, craft, performances, vibe, what kind of viewer it's for. No asterisks, no markdown — just plain JSON.

Output strictly: {"bullets":["...","...","..."]} — no preamble, no trailing text.`;

  const user = `Title: ${title}${year ? ` (${year})` : ""}
Type: ${type === "tv" ? "Series" : "Film"}
Genres: ${genres.join(", ") || "—"}
Synopsis: ${overview || "—"}

Generate 3 spoiler-free pitches.`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Best-effort — strip code fences if any
      const cleaned = raw.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    const bullets = Array.isArray(parsed.bullets)
      ? parsed.bullets.filter((b) => typeof b === "string").slice(0, 3)
      : [];

    if (bullets.length === 0) {
      return res
        .status(502)
        .json({ error: "AI returned no pitch. Try again." });
    }

    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ bullets });
  } catch (err) {
    console.error("ai-pitch error:", err);
    return res.status(500).json({ error: "AI pitch failed" });
  }
}
