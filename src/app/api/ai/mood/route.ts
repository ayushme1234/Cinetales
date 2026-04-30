import { NextResponse } from "next/server";
import { groq, safeParseJson } from "@/lib/groq";
import { tmdbApi, type TmdbMedia } from "@/lib/tmdb";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST { vibe: string }
 * vibe is free-text: "something funny but smart", "rainy day comfort watch",
 * "movies that ruined me", "anime with hard worldbuilding", etc.
 */
export async function POST(req: Request) {
  try {
    const { vibe } = await req.json();
    if (!vibe || typeof vibe !== "string") {
      return NextResponse.json({ error: "vibe required" }, { status: 400 });
    }
    if (vibe.length > 500) {
      return NextResponse.json({ error: "vibe too long (max 500 chars)" }, { status: 400 });
    }

    const sys = `You are CineTales, a Gen Z movie & show curator with great taste. The user describes a vibe in their own words. You suggest exactly 8 picks — a mix of films, shows, anime — that nail the vibe.
Rules:
- Match the EXACT mood/feeling, not generic genre matches.
- Mix tones: include some classics, some recent, some hidden gems.
- Be specific about why each pick matches.
- Return STRICT JSON only, no fences, no preamble.
Schema:
{ "summary": "1-line interpretation of the user's vibe", "picks": [ { "title": "string", "year": "YYYY", "type": "movie" | "tv", "why": "1 short sentence explaining the vibe match" } ] }`;

    const raw = await groq(
      [
        { role: "system", content: sys },
        { role: "user", content: `Vibe: ${vibe}\n\nGive me 8 picks. JSON only.` },
      ],
      {
        temperature: 0.9,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      }
    );

    const parsed = safeParseJson<{
      summary: string;
      picks: { title: string; year: string; type: "movie" | "tv"; why: string }[];
    }>(raw);

    if (!parsed?.picks?.length) {
      return NextResponse.json({ error: "AI gave no usable picks" }, { status: 502 });
    }

    // Enrich with TMDB
    const enriched = await Promise.all(
      parsed.picks.slice(0, 8).map(async (pick) => {
        try {
          const search = await tmdbApi.search(pick.title);
          const match =
            (search.results as TmdbMedia[]).find((r) => {
              if (r.media_type === "person") return false;
              const sameType = r.media_type === pick.type;
              const yr = (r.release_date || r.first_air_date || "").slice(0, 4);
              return sameType && (!pick.year || yr === pick.year);
            }) || search.results.find((r) => r.media_type !== "person");

          if (!match) return null;
          return {
            id: match.id,
            title: match.title || match.name || pick.title,
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
      summary: parsed.summary,
      picks: enriched.filter(Boolean),
    });
  } catch (e) {
    console.error("AI mood failed:", e);
    return NextResponse.json({ error: "AI mood failed" }, { status: 500 });
  }
}
