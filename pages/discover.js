// CineTales — /discover page.
// Filter pills (genre, year, type, min rating), sort dropdown, responsive grid,
// load-more pagination, URL query param sync.

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";
import { discoverMovies, discoverTV, getMovieGenres, getTVGenres } from "../lib/tmdb";

const SORTS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
  { value: "primary_release_date.asc", label: "Oldest" },
  { value: "original_title.asc", label: "Title A–Z" },
];

const TV_SORTS = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "first_air_date.desc", label: "Newest" },
  { value: "first_air_date.asc", label: "Oldest" },
  { value: "name.asc", label: "Title A–Z" },
];

const YEARS = (() => {
  const out = [];
  const cur = new Date().getFullYear();
  for (let y = cur; y >= 1970; y--) out.push(y);
  return out;
})();

export default function DiscoverPage({ initialItems, initialPage, initialTotalPages, genres, filters }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems || []);
  const [page, setPage] = useState(initialPage || 1);
  const [totalPages, setTotalPages] = useState(initialTotalPages || 1);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState(filters.type || "movie");
  const [genre, setGenre] = useState(filters.genre || "");
  const [year, setYear] = useState(filters.year || "");
  const [minRating, setMinRating] = useState(filters.minRating || 0);
  const [sortBy, setSortBy] = useState(filters.sortBy || "popularity.desc");

  const updateUrl = useCallback(
    (overrides = {}) => {
      const next = {
        type: overrides.type ?? type,
        genre: overrides.genre ?? genre,
        year: overrides.year ?? year,
        minRating: overrides.minRating ?? minRating,
        sortBy: overrides.sortBy ?? sortBy,
      };
      const q = {};
      if (next.type) q.type = next.type;
      if (next.genre) q.genre = next.genre;
      if (next.year) q.year = next.year;
      if (next.minRating && Number(next.minRating) > 0) q.minRating = next.minRating;
      if (next.sortBy && next.sortBy !== "popularity.desc") q.sortBy = next.sortBy;
      router.replace({ pathname: "/discover", query: q }, undefined, { shallow: false, scroll: false });
    },
    [router, type, genre, year, minRating, sortBy]
  );

  const handleType = (newType) => {
    setType(newType);
    setPage(1);
    updateUrl({ type: newType });
  };
  const handleGenre = (newGenre) => {
    setGenre(newGenre);
    setPage(1);
    updateUrl({ genre: newGenre });
  };
  const handleYear = (newYear) => {
    setYear(newYear);
    setPage(1);
    updateUrl({ year: newYear });
  };
  const handleMinRating = (newRating) => {
    setMinRating(newRating);
    setPage(1);
  };
  const handleMinRatingCommit = (newRating) => {
    updateUrl({ minRating: newRating });
  };
  const handleSort = (newSort) => {
    setSortBy(newSort);
    setPage(1);
    updateUrl({ sortBy: newSort });
  };

  useEffect(() => {
    setItems(initialItems || []);
    setPage(initialPage || 1);
    setTotalPages(initialTotalPages || 1);
  }, [initialItems, initialPage, initialTotalPages]);

  async function loadMore() {
    if (loading || page >= totalPages) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = new URLSearchParams({
        type,
        sortBy,
        page: String(nextPage),
      });
      if (genre) params.set("genre", genre);
      if (year) params.set("year", year);
      if (minRating) params.set("minRating", minRating);
      const res = await fetch(`/api/discover?${params.toString()}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.results || [])]);
      setPage(nextPage);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const sortOptions = type === "movie" ? SORTS : TV_SORTS;
  const visibleGenres = genres[type] || [];

  return (
    <>
      <Head>
        <title>Discover — CineTales</title>
        <meta name="description" content="Browse and filter movies and series. Sort by popularity, rating, or release date." />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24">
        <div className="container-x">
          <header className="mb-10 max-w-3xl animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent/70 mb-3">// browse the library</p>
            <h1 className="font-display text-5xl md:text-6xl text-text-1 leading-[0.95]">Discover</h1>
            <p className="mt-4 text-text-2 text-base md:text-lg">
              Filter by genre, year, rating. Sort however you like. The full TMDB catalog, in your hands.
            </p>
          </header>

          {/* Filter row */}
          <div className="mb-8 space-y-4">
            {/* Type toggle */}
            <div className="flex gap-2">
              {[
                { v: "movie", l: "Movies" },
                { v: "tv", l: "Series" },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => handleType(opt.v)}
                  className={`px-5 py-2 rounded-full text-sm font-medium border btn-press transition ${
                    type === opt.v
                      ? "bg-accent text-white border-accent"
                      : "bg-surface text-text-2 border-border hover:text-text-1 hover:border-border-light"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap gap-3 items-center">
              <select
                value={genre}
                onChange={(e) => handleGenre(e.target.value)}
                className="bg-surface border border-border text-text-1 text-sm rounded-full px-4 py-2 hover:border-border-light focus:border-accent focus:outline-none"
              >
                <option value="">All genres</option>
                {visibleGenres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>

              <select
                value={year}
                onChange={(e) => handleYear(e.target.value)}
                className="bg-surface border border-border text-text-1 text-sm rounded-full px-4 py-2 hover:border-border-light focus:border-accent focus:outline-none"
              >
                <option value="">Any year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleSort(e.target.value)}
                className="bg-surface border border-border text-text-1 text-sm rounded-full px-4 py-2 hover:border-border-light focus:border-accent focus:outline-none ml-auto"
              >
                {sortOptions.map((s) => (
                  <option key={s.value} value={s.value}>
                    Sort: {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating slider */}
            <div className="flex items-center gap-4 max-w-md">
              <span className="text-mono text-xs uppercase tracking-[0.2em] text-text-3 w-24">Min Rating</span>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => handleMinRating(e.target.value)}
                onMouseUp={(e) => handleMinRatingCommit(e.target.value)}
                onTouchEnd={(e) => handleMinRatingCommit(e.target.value)}
                className="flex-1 accent-accent"
              />
              <span className="text-mono text-sm text-accent w-10 text-right">{Number(minRating).toFixed(1)}</span>
            </div>
          </div>

          {/* Grid */}
          {items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-text-2">No results match these filters. Try loosening them.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
              {items.map((item) => (
                <MovieCard
                  key={`${type}-${item.id}`}
                  item={{ ...item, media_type: type }}
                />
              ))}
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
            </div>
          )}

          {/* Load more */}
          {page < totalPages && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-8 py-3 rounded-full bg-surface border border-border-light text-text-1 hover:border-accent hover:text-accent transition btn-press disabled:opacity-50"
              >
                {loading ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps(ctx) {
  const q = ctx.query || {};
  const filters = {
    type: q.type === "tv" ? "tv" : "movie",
    genre: q.genre || "",
    year: q.year || "",
    minRating: q.minRating || 0,
    sortBy: q.sortBy || "popularity.desc",
  };
  try {
    const fetcher = filters.type === "tv" ? discoverTV : discoverMovies;
    const data = await fetcher({
      genre: filters.genre || undefined,
      year: filters.year || undefined,
      sortBy: filters.sortBy,
      minRating: Number(filters.minRating) || undefined,
      page: 1,
    });
    const [movieGenres, tvGenres] = await Promise.all([
      getMovieGenres().catch(() => ({ genres: [] })),
      getTVGenres().catch(() => ({ genres: [] })),
    ]);
    ctx.res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return {
      props: {
        initialItems: data.results || [],
        initialPage: data.page || 1,
        initialTotalPages: Math.min(data.total_pages || 1, 500),
        genres: {
          movie: movieGenres.genres || [],
          tv: tvGenres.genres || [],
        },
        filters,
      },
    };
  } catch (err) {
    console.error("discover ssr:", err);
    return {
      props: {
        initialItems: [],
        initialPage: 1,
        initialTotalPages: 1,
        genres: { movie: [], tv: [] },
        filters,
      },
    };
  }
}
