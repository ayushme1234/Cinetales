import { NextResponse } from "next/server";
import { groq, safeParseJson } from "@/lib/groq";
import { tmdbApi, type TmdbMedia } from "@/lib/tmdb";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST { title: string, mediaType: "movie" | "tv", overview?: string, genres?: string[] }
 * Returns enriched suggestions with TMDB metadata.
 */
export async function POST(req: Request) {
  try {
    const { title, mediaType, overview, genres } = await req.json();
    if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

    const sys = `You are CineTales, a witty Gen Z movie & show recommender. Given a title, suggest exactly 6 similar films/shows the user would love — different from the input.
Rules:
- Mix popular and lesser-known picks (don't just give blockbusters).
- Each pick should share a specific vibe with the input — name the vibe.
- Return STRICT JSON only, no markdown fences, no preamble.
Schema:
{ "picks": [ { "title": "string", "year": "YYYY", "type": "movie" | "tv", "why": "1 short punchy sentence about the shared vibe" } ] }`;

    const userPrompt = `Input title: "${title}" (${mediaType === "tv" ? "TV series" : "film"})
${overview ? `Plot summary: ${overview}` : ""}
${genres?.length ? `Genres: ${genres.join(", ")}` : ""}

Suggest 6 similar picks the user should try next. Return JSON only.`;

    const raw = await groq(
      [
        { role: "system", content: sys },
        { role: "user", content: userPrompt },
      ],
      {
        temperature: 0.8,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }
    );

    const parsed = safeParseJson<{ picks: { title: string; year: string; type: "movie" | "tv"; why: string }[] }>(raw);
    if (!parsed?.picks?.length) {
      return NextResponse.json({ error: "AI gave no usable picks", raw }, { status: 502 });
    }

    // Look up each pick on TMDB to get poster + ID for linking
    const enriched = await Promise.all(
      parsed.picks.slice(0, 6).map(async (pick) => {
        try {
          const search = await tmdbApi.search(pick.title);
          // Find best match: matching type and year (if provided)
          const match = (search.results as TmdbMedia[]).find((r) => {
            if (r.media_type === "person") return false;
            const sameType = r.media_type === pick.type;
            const yr = (r.release_date || r.first_air_date || "").slice(0, 4);
            return sameType && (!pick.year || yr === pick.year);
          }) || search.results.find((r) => r.media_type !== "person");

          if (!match) return null;
          return {
            id: match.id,
            tmdbTitle: match.title || match.name,
            year: (match.release_date || match.first_air_date || "").slice(0, 4),
            poster: match.poster_path || null,
            mediaType: match.media_type === "tv" ? "tv" : "movie",
            why: pick.why,
            voteAverage: match.vote_average,
          };
        } catch {
          return null;
        }
      })
    );

    return NextResponse.json({
      picks: enriched.filter(Boolean),
    });
  } catch (e) {
    console.error("AI recommend failed:", e);
    return NextResponse.json({ error: "AI recommend failed" }, { status: 500 });
  }
}
