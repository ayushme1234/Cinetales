// CineTales — /api/vibes (VibesAI).
// Given a mood/vibe prompt, returns 8 film/show recommendations enriched
// with TMDB metadata for posters, scores, and direct links.

import Groq from "groq-sdk";
import { searchMulti } from "../../lib/tmdb";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYS = `You are a cinematic recommendation engine. Given a user's vibe or mood, recommend exactly 8 films or shows that match.

Respond ONLY with valid JSON — no markdown, no commentary:
{
  "recommendations": [
    {
      "title": "Exact Title",
      "year": 2019,
      "type": "movie" | "tv",
      "reason": "One vivid sentence why this fits the vibe (max 25 words). Spoiler-free."
    }
  ]
}

Rules:
- Exactly 8 picks. Mix well-known and underrated. Don't repeat directors.
- Use REAL titles only — they must exist on TMDB.
- "type" must be "movie" or "tv".
- "year" must be a number.
- Keep reasons evocative and tight.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt required" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYS },
        { role: "user", content: prompt.slice(0, 500) },
      ],
      temperature: 0.85,
      max_tokens: 1100,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { recommendations: [] };
    }

    const recs = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.slice(0, 8)
      : [];

    // Enrich each rec with TMDB — match by title + (optionally) year
    const enriched = await Promise.all(
      recs.map(async (r) => {
        try {
          const sr = await searchMulti(r.title, 1);
          const candidates = (sr.results || []).filter(
            (x) =>
              (x.media_type === "movie" || x.media_type === "tv") &&
              x.poster_path
          );
          let pick = candidates[0];
          if (r.year && candidates.length > 1) {
            const matched = candidates.find((c) => {
              const y = (c.release_date || c.first_air_date || "").slice(0, 4);
              return y === String(r.year);
            });
            if (matched) pick = matched;
          }
          // Also prefer same type as AI suggested
          if (r.type && candidates.length > 1) {
            const matched = candidates.find((c) => c.media_type === r.type);
            if (matched && (!pick || pick.media_type !== r.type)) {
              pick = matched;
            }
          }
          return { ...r, enriched: pick || null };
        } catch (e) {
          return { ...r, enriched: null };
        }
      })
    );

    return res.status(200).json({ recommendations: enriched });
  } catch (err) {
    console.error("Vibes API error:", err);
    return res.status(500).json({ error: "Failed to get recommendations" });
  }
}
