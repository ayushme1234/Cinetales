// CineTales — /api/ai-match
// Takes two titles (text or TMDB-resolved). Asks Groq to suggest 5 films
// that bridge / sit between them tonally. Enriches with TMDB.

import Groq from "groq-sdk";
import { searchMulti, posterUrl } from "../../lib/tmdb";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYS = `You are a cinephile friend who recommends films and shows that BRIDGE two titles a user loves. Given Title A and Title B, suggest 5 titles that sit tonally, thematically, or stylistically between them — capturing what makes BOTH special.

Output strict JSON only — no preamble, no markdown:
{
  "bridge_summary": "1 sentence explaining the shared thread between A and B (max 22 words).",
  "recommendations": [
    {"title": "Exact film/show title", "year": 2020, "type": "movie" | "tv", "reason": "1 sentence on why this bridges A and B (max 25 words). Spoiler-free."}
  ]
}

Rules:
- Exactly 5 recommendations.
- Use REAL titles only — must exist on TMDB.
- Mix well-known and slightly underrated picks.
- Vary the picks — don't suggest 5 films from the same director.
- "type" is "movie" or "tv".
- Year must be a number (release year for film, first-air year for show).`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const { titleA, titleB } = req.body || {};
  if (!titleA || !titleB) {
    return res.status(400).json({ error: "Provide two titles" });
  }

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYS },
        {
          role: "user",
          content: `Title A: ${titleA}\nTitle B: ${titleB}\n\nReturn 5 bridge picks.`,
        },
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
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    }

    const recs = Array.isArray(parsed.recommendations)
      ? parsed.recommendations.slice(0, 5)
      : [];

    // Enrich each rec with TMDB data
    const enriched = await Promise.all(
      recs.map(async (r) => {
        try {
          const sr = await searchMulti(r.title, 1);
          const wanted = (sr.results || []).find(
            (x) => x.media_type === (r.type === "tv" ? "tv" : "movie")
          ) || (sr.results || [])[0];
          if (wanted && (wanted.media_type === "movie" || wanted.media_type === "tv")) {
            return {
              ...r,
              tmdb_id: wanted.id,
              media_type: wanted.media_type,
              poster_path: wanted.poster_path,
              poster_url: posterUrl(wanted.poster_path, "w342"),
              backdrop_path: wanted.backdrop_path,
              vote_average: wanted.vote_average,
              overview: wanted.overview,
            };
          }
          return r;
        } catch {
          return r;
        }
      })
    );

    return res.status(200).json({
      bridge_summary: parsed.bridge_summary || "",
      recommendations: enriched,
    });
  } catch (err) {
    console.error("ai-match error:", err);
    return res.status(500).json({ error: "AI Match failed" });
  }
}
