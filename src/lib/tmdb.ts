// Minimal TMDB v3 client using the v4 Bearer token.
// Docs: https://developer.themoviedb.org/reference/intro/getting-started

const BASE = "https://api.themoviedb.org/3";

// We proxy TMDB images through our own /api/img route. This is critical for
// users on Indian ISPs (Jio/Airtel/ACT/BSNL) that intermittently block
// image.tmdb.org at the DNS level. Server-to-server fetch from Vercel works
// fine, so we shift the load there.
export const IMG = {
  poster: (path?: string | null, size: "w185" | "w342" | "w500" | "original" = "w500") =>
    path ? `/api/img?path=${encodeURIComponent(path)}&size=${size}` : null,
  backdrop: (path?: string | null, size: "w780" | "w1280" | "original" = "w1280") =>
    path ? `/api/img?path=${encodeURIComponent(path)}&size=${size}` : null,
  /** For lucide-react / external uses where you really need the direct URL */
  direct: (path?: string | null, size: string = "w500") =>
    path ? `https://image.tmdb.org/t/p/${size}${path}` : null,
};

async function tmdb<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  const token = process.env.TMDB_BEARER_TOKEN;
  if (!token) throw new Error("TMDB_BEARER_TOKEN is not set");

  const url = new URL(BASE + path);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    // Cache popular/trending endpoints for 1 hour. Specific titles for 24h.
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`TMDB ${res.status}: ${await res.text()}`);
  return res.json();
}

export interface TmdbMedia {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: "movie" | "tv" | "person";
}

export interface TmdbDetails extends TmdbMedia {
  runtime?: number;
  episode_run_time?: number[];
  genres?: { id: number; name: string }[];
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string }[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string; // "YouTube" | "Vimeo"
      type: string; // "Trailer" | "Teaser" | "Clip" | "Featurette"
      official: boolean;
      published_at: string;
    }[];
  };
  images?: {
    backdrops: { file_path: string; width: number; height: number }[];
  };
  "watch/providers"?: {
    results: Record<
      string,
      {
        link: string;
        flatrate?: { provider_id: number; provider_name: string; logo_path: string }[];
        rent?: { provider_id: number; provider_name: string; logo_path: string }[];
        buy?: { provider_id: number; provider_name: string; logo_path: string }[];
      }
    >;
  };
}

export const tmdbApi = {
  trending: (window: "day" | "week" = "week") =>
    tmdb<{ results: TmdbMedia[] }>(`/trending/all/${window}`),
  popularMovies: () => tmdb<{ results: TmdbMedia[] }>("/movie/popular"),
  popularTv: () => tmdb<{ results: TmdbMedia[] }>("/tv/popular"),
  topRated: () => tmdb<{ results: TmdbMedia[] }>("/movie/top_rated"),
  search: (query: string) =>
    tmdb<{ results: TmdbMedia[] }>("/search/multi", { query, include_adult: "false" }),
  details: (mediaType: "movie" | "tv", id: number) =>
    tmdb<TmdbDetails>(`/${mediaType}/${id}`, {
      append_to_response: "credits,watch/providers,similar,videos,images",
      include_image_language: "en,null",
    }),
  // List of genres (movie + tv have separate IDs in TMDB)
  movieGenres: () => tmdb<{ genres: { id: number; name: string }[] }>("/genre/movie/list"),
  tvGenres: () => tmdb<{ genres: { id: number; name: string }[] }>("/genre/tv/list"),
  // Discover with filters
  discoverMovies: (params: {
    genre?: number;
    year?: number;
    sort?: string;          // popularity.desc | vote_average.desc | release_date.desc
    minRating?: number;     // 0..10
    page?: number;
  }) => {
    const p: Record<string, string | number> = {
      sort_by: params.sort || "popularity.desc",
      include_adult: "false",
      page: params.page || 1,
      "vote_count.gte": 50, // avoid garbage results when sorting by rating
    };
    if (params.genre) p.with_genres = params.genre;
    if (params.year) p.primary_release_year = params.year;
    if (params.minRating) p["vote_average.gte"] = params.minRating;
    return tmdb<{ results: TmdbMedia[]; total_pages: number }>("/discover/movie", p);
  },
  discoverTv: (params: {
    genre?: number;
    year?: number;
    sort?: string;
    minRating?: number;
    page?: number;
  }) => {
    const p: Record<string, string | number> = {
      sort_by: params.sort || "popularity.desc",
      include_adult: "false",
      page: params.page || 1,
      "vote_count.gte": 50,
    };
    if (params.genre) p.with_genres = params.genre;
    if (params.year) p.first_air_date_year = params.year;
    if (params.minRating) p["vote_average.gte"] = params.minRating;
    return tmdb<{ results: TmdbMedia[]; total_pages: number }>("/discover/tv", p);
  },
};

export function getTitle(m: TmdbMedia): string {
  return m.title || m.name || "Untitled";
}

export function getYear(m: TmdbMedia): string {
  const d = m.release_date || m.first_air_date;
  return d ? d.slice(0, 4) : "";
}

/** Pick the best YouTube trailer/teaser. Prefers official Trailer over Teaser, latest first. */
export function pickTrailer(videos?: TmdbDetails["videos"]) {
  if (!videos?.results?.length) return null;
  const yt = videos.results.filter((v) => v.site === "YouTube");
  const score = (v: { type: string; official: boolean }) => {
    let s = 0;
    if (v.type === "Trailer") s += 10;
    else if (v.type === "Teaser") s += 5;
    else if (v.type === "Clip") s += 2;
    if (v.official) s += 3;
    return s;
  };
  const sorted = [...yt].sort((a, b) => {
    const diff = score(b) - score(a);
    if (diff !== 0) return diff;
    return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
  });
  return sorted[0] || null;
}
