"use client";

import { useState, useEffect, useMemo } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MediaCard } from "@/components/media-card";
import { Search as SearchIcon, Loader2, SlidersHorizontal } from "lucide-react";
import type { TmdbMedia } from "@/lib/tmdb";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TmdbMedia[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters (client-side, applied to TMDB search results)
  const [typeFilter, setTypeFilter] = useState<"all" | "movie" | "tv">("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "year">("relevance");

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResults((data.results || []).filter((r: TmdbMedia) => r.media_type !== "person"));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  const filteredResults = useMemo(() => {
    let list = [...results];
    if (typeFilter !== "all") list = list.filter((r) => r.media_type === typeFilter);
    if (minRating > 0) list = list.filter((r) => (r.vote_average || 0) >= minRating);
    if (sortBy === "rating") list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    else if (sortBy === "year")
      list.sort((a, b) => {
        const ay = (a.release_date || a.first_air_date || "").slice(0, 4);
        const by = (b.release_date || b.first_air_date || "").slice(0, 4);
        return by.localeCompare(ay);
      });
    return list;
  }, [results, typeFilter, minRating, sortBy]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <h1 className="display-xl text-5xl md:text-7xl">Search.</h1>
        <p className="mt-2 text-lg text-ink/70">Type any movie, show, or anime title.</p>

        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-cream p-3 brut">
          <SearchIcon size={22} className="ml-2 shrink-0" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try 'Oppenheimer' or 'Demon Slayer'..."
            className="w-full bg-transparent py-2 text-lg font-semibold outline-none"
            autoFocus
          />
          {loading && <Loader2 size={20} className="mr-2 animate-spin" />}
        </div>

        {/* Filter bar (only visible once we have results) */}
        {results.length > 0 && (
          <div className="mt-6 rounded-2xl bg-cream p-5 brut">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-ink/60">
              <SlidersHorizontal size={14} /> Refine
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <Group label="Type">
                {[
                  { id: "all", label: "All" },
                  { id: "movie", label: "Films" },
                  { id: "tv", label: "Series" },
                ].map((t) => (
                  <Chip
                    key={t.id}
                    active={typeFilter === t.id}
                    onClick={() => setTypeFilter(t.id as any)}
                    activeColor="brut-cobalt"
                  >
                    {t.label}
                  </Chip>
                ))}
              </Group>
              <Group label="Min rating">
                {[0, 6, 7, 8].map((r) => (
                  <Chip
                    key={r}
                    active={minRating === r}
                    onClick={() => setMinRating(r)}
                    activeColor="brut-acid"
                  >
                    {r === 0 ? "Any" : `${r}+ ★`}
                  </Chip>
                ))}
              </Group>
              <Group label="Sort">
                {[
                  { id: "relevance", label: "Best match" },
                  { id: "rating", label: "Top rated" },
                  { id: "year", label: "Newest" },
                ].map((s) => (
                  <Chip
                    key={s.id}
                    active={sortBy === s.id}
                    onClick={() => setSortBy(s.id as any)}
                    activeColor="brut-tangerine"
                  >
                    {s.label}
                  </Chip>
                ))}
              </Group>
            </div>
          </div>
        )}

        <div className="mt-10">
          {filteredResults.length === 0 && q && !loading && (
            <p className="display-xl text-3xl">No results. Try another spelling?</p>
          )}
          {filteredResults.length > 0 && (
            <p className="mb-4 text-sm font-bold uppercase tracking-widest text-ink/60">
              {filteredResults.length} of {results.length} match
            </p>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {filteredResults.map((r) => (
              <MediaCard key={`${r.media_type}-${r.id}`} item={r} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/60">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  activeColor,
  children,
}: {
  active: boolean;
  onClick: () => void;
  activeColor: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase brut transition ${
        active ? activeColor : "brut-cream opacity-60 hover:opacity-100"
      }`}
    >
      {children}
    </button>
  );
}
