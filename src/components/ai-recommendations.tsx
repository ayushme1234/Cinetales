"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { IMG } from "@/lib/tmdb";

interface Pick {
  id: number;
  tmdbTitle: string;
  year: string;
  poster: string | null;
  mediaType: "movie" | "tv";
  why: string;
  voteAverage?: number;
}

interface Props {
  title: string;
  mediaType: "movie" | "tv";
  overview?: string;
  genres?: string[];
}

export function AIRecommendations({ title, mediaType, overview, genres }: Props) {
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPicks() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, mediaType, overview, genres }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      setPicks(data.picks || []);
    } catch (e: any) {
      setError(e?.message || "AI hiccupped — try again?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="rounded-3xl bg-ink p-7 text-cream brut md:p-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">
              // ai pick · powered by llama
            </p>
            <h2 className="display-xl mt-2 text-3xl md:text-5xl">
              If you liked this,{" "}
              <span className="serif-italic font-normal italic text-acid">try these.</span>
            </h2>
          </div>
          {picks && (
            <button
              onClick={fetchPicks}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-cream px-4 py-2 text-sm font-bold uppercase text-ink brut-soft disabled:opacity-50"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              New picks
            </button>
          )}
        </div>

        {!picks && !loading && (
          <button
            onClick={fetchPicks}
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-acid px-6 py-3 text-base font-bold uppercase tracking-wider text-ink brut"
          >
            <Sparkles size={18} /> Generate AI picks
          </button>
        )}

        {loading && !picks && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-electric/20 p-4 font-mono text-sm">
            {error}{" "}
            <button onClick={fetchPicks} className="underline">
              retry
            </button>
          </div>
        )}

        {picks && picks.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {picks.map((p, i) => (
              <Link
                key={p.id}
                href={`/${p.mediaType}/${p.id}`}
                className="poster-card group block fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl border-[2.5px] border-cream bg-cream/10">
                  {p.poster ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={IMG.poster(p.poster, "w500") || ""}
                      alt={p.tmdbTitle}
                      loading="lazy"
                      className="poster-img h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center p-3 text-center text-xs font-bold">
                      {p.tmdbTitle}
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent opacity-0 transition group-hover:opacity-100" />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition group-hover:opacity-100">
                    <p className="line-clamp-3 text-[11px] leading-snug text-cream">{p.why}</p>
                  </div>
                </div>
                <h3 className="mt-2 line-clamp-1 text-sm font-bold">{p.tmdbTitle}</h3>
                <p className="text-xs text-cream/60">
                  {p.year} · {p.mediaType === "tv" ? "Series" : "Film"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
