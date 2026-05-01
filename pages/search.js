// CineTales — /search page.
// Moctale-style search: big input at top, filter tabs, results grid OR
// empty state with popular search chips. Fixed dark input styling so
// typed text is always visible.

import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";

const POPULAR = [
  "Inception",
  "Breaking Bad",
  "Spirited Away",
  "Interstellar",
  "Attack on Titan",
  "Dune",
  "Oppenheimer",
  "The Bear",
];

export default function SearchPage() {
  const router = useRouter();
  const initialQ = typeof router.query.q === "string" ? router.query.q : "";
  const [q, setQ] = useState(initialQ);
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Auto-focus the input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Sync to query string
  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  // Debounced search
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results || []);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Update URL
  useEffect(() => {
    const trimmed = q.trim();
    const current = (router.query.q || "").toString();
    if (trimmed === current) return;
    const t = setTimeout(() => {
      router.replace(
        { pathname: "/search", query: trimmed ? { q: trimmed } : {} },
        undefined,
        { shallow: true }
      );
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  function pickPopular(text) {
    setQ(text);
    inputRef.current?.focus();
  }

  // Filter results by media_type
  const filtered = results.filter((r) => {
    if (filter === "all") return true;
    if (filter === "movies") return r.media_type === "movie";
    if (filter === "series") return r.media_type === "tv";
    if (filter === "anime")
      return (
        (r.media_type === "tv" || r.media_type === "movie") &&
        ((r.original_language === "ja") ||
          (r.genre_ids || []).includes(16))
      );
    return true;
  });

  const counts = {
    all: results.length,
    movies: results.filter((r) => r.media_type === "movie").length,
    series: results.filter((r) => r.media_type === "tv").length,
    anime: results.filter(
      (r) =>
        (r.media_type === "tv" || r.media_type === "movie") &&
        (r.original_language === "ja" || (r.genre_ids || []).includes(16))
    ).length,
  };

  return (
    <>
      <Head>
        <title>Search — CineTales</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24 purple-wash-top relative">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[40vh] grid-bg opacity-20 pointer-events-none" />

        <div className="container-x relative">
          {/* ─── Big search bar ─────────────────────────── */}
          <div className="max-w-3xl mx-auto mb-10 animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent mb-3 text-center">
              // search
            </p>
            <h1 className="font-display text-3xl md:text-5xl text-text-1 leading-tight text-center mb-8">
              Find what to watch.
            </h1>

            <label className="block relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-3 pointer-events-none">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </span>
              <input
                ref={inputRef}
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search movies, series, anime…"
                className="w-full bg-surface border border-border-light rounded-2xl pl-14 pr-12 py-4 text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none text-base md:text-lg"
                style={{
                  // Defensive — ensure dark bg + light text even if browser
                  // autofill or extension tries to override
                  backgroundColor: "var(--surface)",
                  color: "var(--text-1)",
                  caretColor: "var(--accent)",
                }}
                autoComplete="off"
                spellCheck="false"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => {
                    setQ("");
                    inputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-full bg-elevated border border-border text-text-2 hover:text-text-1 hover:border-border-light btn-press"
                  aria-label="Clear"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </label>
          </div>

          {/* ─── Filter tabs ─────────────────────────────── */}
          {hasSearched && (
            <div className="max-w-3xl mx-auto mb-8 flex gap-2 overflow-x-auto no-scrollbar">
              {[
                { v: "all", l: "All", c: counts.all },
                { v: "movies", l: "Movies", c: counts.movies },
                { v: "series", l: "Series", c: counts.series },
                { v: "anime", l: "Anime", c: counts.anime },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilter(opt.v)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition btn-press ${
                    filter === opt.v
                      ? "bg-accent text-white border-accent"
                      : "bg-surface text-text-2 border-border hover:text-text-1 hover:border-border-light"
                  }`}
                >
                  {opt.l}
                  {opt.c > 0 && (
                    <span
                      className={`ml-1.5 text-xs ${
                        filter === opt.v ? "text-white/80" : "text-text-3"
                      }`}
                    >
                      {opt.c}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ─── Empty state — show popular search chips ── */}
          {!hasSearched && (
            <div className="max-w-3xl mx-auto text-center">
              <div className="mb-6 inline-grid place-items-center w-20 h-20 rounded-full bg-elevated border border-border">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </div>
              <p className="font-display text-xl text-text-1 mb-2">
                Start typing to search
              </p>
              <p className="text-text-3 text-sm mb-8">
                Or pick something popular below
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => pickPopular(p)}
                    className="px-3.5 py-1.5 rounded-full bg-surface border border-border text-text-2 text-sm hover:border-accent hover:text-accent btn-press"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Loading skeletons ───────────────────────── */}
          {loading && hasSearched && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ─── Results grid ────────────────────────────── */}
          {!loading && hasSearched && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4 animate-fade-in">
              {filtered.map((r) => (
                <MovieCard
                  key={`${r.media_type}-${r.id}`}
                  item={r}
                  priority={false}
                />
              ))}
            </div>
          )}

          {/* ─── No results ──────────────────────────────── */}
          {!loading && hasSearched && filtered.length === 0 && (
            <div className="max-w-xl mx-auto text-center py-12">
              <p className="font-display text-2xl text-text-1 mb-2">
                Nothing found.
              </p>
              <p className="text-text-3 text-sm">
                Try a different search or filter.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
