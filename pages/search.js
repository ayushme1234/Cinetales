import Head from "next/head";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SearchBar from "../components/SearchBar";
import MovieCard from "../components/MovieCard";
import SkeletonCard from "../components/SkeletonCard";

const POPULAR = [
  "Inception",
  "Breaking Bad",
  "Spirited Away",
  "Interstellar",
  "Attack on Titan",
  "Dune",
];

export default function SearchPage() {
  const router = useRouter();
  const initialQ = typeof router.query.q === "string" ? router.query.q : "";
  const [q, setQ] = useState(initialQ);
  const [filter, setFilter] = useState("all");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        setResults(j.results || []);
      } catch (e) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // Sync URL
  useEffect(() => {
    const desired = q ? `/search?q=${encodeURIComponent(q)}` : "/search";
    if (router.asPath !== desired) {
      router.replace(desired, undefined, { shallow: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const filtered = results.filter((m) => {
    if (m.media_type === "person") return false;
    if (filter === "all") return true;
    if (filter === "movies") return m.media_type === "movie";
    if (filter === "tv") return m.media_type === "tv";
    if (filter === "anime") {
      // crude: TV with animation genre id 16, or original_language ja
      return (
        (m.media_type === "tv" || m.media_type === "movie") &&
        ((m.genre_ids || []).includes(16) || m.original_language === "ja")
      );
    }
    return true;
  });

  return (
    <>
      <Head>
        <title>Search — CineTales</title>
      </Head>
      <Navbar />
      <main className="container-x pt-28 pb-12 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-xs uppercase tracking-widest2 text-[var(--accent)] mb-3">
            // search
          </p>
          <h1 className="font-display text-4xl md:text-6xl mb-7 leading-tight">
            What are you in the<br /><span className="italic text-[var(--accent)]">mood for?</span>
          </h1>

          <SearchBar value={q} onChange={setQ} autoFocus />

          <div className="mt-5 flex flex-wrap gap-2">
            {[
              { k: "all", l: "All" },
              { k: "movies", l: "Movies" },
              { k: "tv", l: "TV Shows" },
              { k: "anime", l: "Anime" },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider btn-press ${
                  filter === f.k
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--border-light)] text-[var(--text-2)] hover:text-[var(--text-1)]"
                }`}
              >
                {f.l}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {!q.trim() && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest2 text-[var(--text-3)] mb-3">
                Popular searches
              </p>
              <div className="flex flex-wrap gap-2">
                {POPULAR.map((p) => (
                  <button
                    key={p}
                    onClick={() => setQ(p)}
                    className="px-4 py-2 rounded-full border border-[var(--border)] text-sm text-[var(--text-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] btn-press"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {!loading && q.trim() && filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="font-display text-2xl text-[var(--text-2)]">No results for "{q}"</p>
              <p className="text-sm text-[var(--text-3)] mt-2">Try a different keyword.</p>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <>
              <p className="font-mono text-xs uppercase tracking-widest2 text-[var(--text-3)] mb-4">
                {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
                {filtered.map((m) => (
                  <MovieCard key={`${m.media_type}-${m.id}`} item={m} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
