// CineTales — TMDB v3 client using v4 Bearer token.
// IMPORTANT: never use ?api_key= — only Authorization: Bearer header.

const BASE = "https://api.themoviedb.org/3";

const headers = () => ({
  Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN}`,
  "Content-Type": "application/json",
});

async function tmdb(path, params = {}, revalidate = 3600) {
  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`TMDB ${res.status}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

// ───── Image URLs ─────────────────────────────────────────────
export function posterUrl(path, size = "w342") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
export function backdropUrl(path, size = "w1280") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
export function profileUrl(path, size = "w185") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
export function logoUrl(path, size = "w92") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

// ───── Endpoints ──────────────────────────────────────────────
export async function getTrending(timeWindow = "week") {
  return tmdb(`/trending/all/${timeWindow}`, { language: "en-US" }, 1800);
}

export async function getPopularMovies(page = 1, region) {
  return tmdb(`/movie/popular`, { language: "en-US", page, region }, 3600);
}

export async function getPopularTV(page = 1) {
  return tmdb(`/tv/popular`, { language: "en-US", page }, 3600);
}

export async function getTopRatedMovies(page = 1) {
  return tmdb(`/movie/top_rated`, { language: "en-US", page }, 3600);
}

export async function getNowPlayingMovies(page = 1, region = "IN") {
  return tmdb(`/movie/now_playing`, { language: "en-US", page, region }, 1800);
}

export async function getUpcomingMovies(page = 1, region = "IN") {
  return tmdb(`/movie/upcoming`, { language: "en-US", page, region }, 1800);
}

export async function getMovieDetail(id) {
  return tmdb(`/movie/${id}`, {
    append_to_response: "credits,videos,similar,watch/providers,images,keywords",
    include_image_language: "en,null",
    language: "en-US",
  }, 86400);
}

export async function getTVDetail(id) {
  return tmdb(`/tv/${id}`, {
    append_to_response: "credits,videos,similar,watch/providers,images,keywords",
    include_image_language: "en,null",
    language: "en-US",
  }, 86400);
}

export async function searchMulti(query, page = 1) {
  return tmdb(`/search/multi`, {
    query,
    page,
    language: "en-US",
    include_adult: "false",
  }, 600);
}

export async function discoverMovies({ genre, year, sortBy = "popularity.desc", minRating, page = 1, originCountry, region } = {}) {
  const params = { sort_by: sortBy, page, language: "en-US", include_adult: "false", "vote_count.gte": 50 };
  if (genre) params.with_genres = genre;
  if (year) params.primary_release_year = year;
  if (minRating) params["vote_average.gte"] = minRating;
  if (originCountry) params.with_origin_country = originCountry;
  if (region) params.region = region;
  return tmdb(`/discover/movie`, params, 1800);
}

export async function discoverTV({ genre, year, sortBy = "popularity.desc", minRating, page = 1, originCountry } = {}) {
  const params = { sort_by: sortBy, page, language: "en-US", "vote_count.gte": 50 };
  if (genre) params.with_genres = genre;
  if (year) params.first_air_date_year = year;
  if (minRating) params["vote_average.gte"] = minRating;
  if (originCountry) params.with_origin_country = originCountry;
  return tmdb(`/discover/tv`, params, 1800);
}

export async function getMovieGenres() {
  return tmdb(`/genre/movie/list`, { language: "en-US" }, 86400);
}

export async function getTVGenres() {
  return tmdb(`/genre/tv/list`, { language: "en-US" }, 86400);
}

// ───── Helpers ────────────────────────────────────────────────
export function getTitle(m) {
  return m?.title || m?.name || "Untitled";
}

export function getYear(m) {
  const d = m?.release_date || m?.first_air_date;
  return d ? d.slice(0, 4) : "";
}

export function pickTrailer(videos) {
  if (!videos?.results?.length) return null;
  const yt = videos.results.filter((v) => v.site === "YouTube");
  if (!yt.length) return null;
  const score = (v) => {
    let s = 0;
    if (v.type === "Trailer") s += 10;
    else if (v.type === "Teaser") s += 5;
    else if (v.type === "Clip") s += 2;
    if (v.official) s += 3;
    return s;
  };
  const sorted = [...yt].sort((a, b) => {
    const d = score(b) - score(a);
    if (d !== 0) return d;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
  return sorted[0] || null;
}

/** Extract watch providers, prioritizing the user's region with sensible fallbacks. */
export function pickProviders(watchProviders, regionPriority = ["IN", "US", "GB"]) {
  const results = watchProviders?.results;
  if (!results) return null;
  // De-duplicate priority list while preserving order
  const seen = new Set();
  const ordered = regionPriority.filter((r) => {
    if (seen.has(r)) return false;
    seen.add(r);
    return true;
  });
  for (const region of ordered) {
    if (results[region]) {
      return { ...results[region], region };
    }
  }
  // Fallback: first available region
  const firstKey = Object.keys(results)[0];
  if (firstKey) return { ...results[firstKey], region: firstKey };
  return null;
}
