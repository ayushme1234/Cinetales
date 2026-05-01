// CineTales — /api/discover proxy for load-more pagination on /discover.
import { discoverMovies, discoverTV } from "../../lib/tmdb";

export default async function handler(req, res) {
  const { type = "movie", genre, year, sortBy = "popularity.desc", minRating, page = 1 } = req.query;
  try {
    const fetcher = type === "tv" ? discoverTV : discoverMovies;
    const data = await fetcher({
      genre: genre || undefined,
      year: year || undefined,
      sortBy,
      minRating: minRating ? Number(minRating) : undefined,
      page: Number(page) || 1,
    });
    res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return res.status(200).json({
      results: data.results || [],
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    });
  } catch (err) {
    console.error("discover api:", err);
    return res.status(500).json({ error: "Discover failed", results: [] });
  }
}
