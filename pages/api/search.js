// CineTales — /api/search proxy. Uses TMDB Bearer token via lib/tmdb.
import { searchMulti } from "../../lib/tmdb";

export default async function handler(req, res) {
  const { q = "", page = 1 } = req.query;
  const query = String(q).trim();
  if (!query) return res.status(200).json({ results: [], total_results: 0, page: 1, total_pages: 0 });
  try {
    const data = await searchMulti(query, Number(page) || 1);
    // Filter out person results — we only show movies/TV
    const results = (data.results || []).filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    );
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json({
      results,
      page: data.page,
      total_results: data.total_results,
      total_pages: data.total_pages,
    });
  } catch (err) {
    console.error("search api error:", err);
    return res.status(500).json({ error: "Search failed", results: [] });
  }
}
