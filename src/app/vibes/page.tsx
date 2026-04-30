"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { IMG } from "@/lib/tmdb";

interface Pick {
  id: number;
  title: string;
  year: string;
  poster: string | null;
  mediaType: "movie" | "tv";
  why: string;
  voteAverage?: number;
}

const PRESETS = [
  "Rainy afternoon, want something cozy and slow",
  "Movies that ruined me emotionally",
  "Anime with crazy worldbuilding",
  "Heist films but make them stylish",
  "Something funny but actually smart",
  "Slow-burn mysteries with great acting",
  "Sci-fi that makes you think",
  "Indian films that aren't basic",
];

export default function VibesPage() {
  const [vibe, setVibe] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [picks, setPicks] = useState<Pick[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(text: string) {
    if (!text.trim() || loading) return;
    setVibe(text);
    setLoading(true);
    setError(null);
    setPicks(null);
    setSummary(null);
    try {
      const res = await fetch("/api/ai/mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI failed");
      setSummary(data.summary || null);
      setPicks(data.picks || []);
    } catch (e: any) {
      setError(e?.message || "AI hiccupped — try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <span className="inline-flex items-center gap-2 rounded-full brut-soft bg-acid px-3 py-1 text-xs font-bold uppercase tracking-widest">
          <Sparkles size={12} /> Powered by Llama 3.3 · free
        </span>
        <h1 className="display-xl mt-4 text-5xl md:text-7xl">
          What's the <span className="serif-italic font-normal italic">vibe?</span>
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-ink/70">
          Describe what you want to feel — not the genre. Our AI picks the right films & shows from
          1M+ titles.
        </p>

        {/* INPUT */}
        <div className="mt-9 rounded-2xl bg-cream p-2 brut">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(vibe);
            }}
            className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center"
          >
            <Wand2 size={22} className="ml-3 hidden shrink-0 sm:block" />
            <input
              type="text"
              value={vibe}
              onChange={(e) => setVibe(e.target.value.slice(0, 500))}
              placeholder="Try: 'something to watch after a breakup'..."
              className="w-full bg-transparent px-3 py-3 text-base font-semibold outline-none sm:px-2 sm:text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!vibe.trim() || loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl brut brut-pink px-5 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Reading vibes
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Match me
                </>
              )}
            </button>
          </form>
        </div>

        {/* PRESETS */}
        {!picks && !loading && (
          <div className="mt-6">
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-ink/60">
              Or try one of these:
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="rounded-full bg-cream px-4 py-2 text-sm font-semibold brut-soft transition hover:-translate-y-0.5 hover:bg-tangerine"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LOADING SKELETON */}
        {loading && (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] shimmer rounded-2xl" />
            ))}
          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mt-8 rounded-2xl bg-electric/10 p-5 brut">
            <p className="font-bold">Hmm, AI got confused.</p>
            <p className="mt-1 text-sm text-ink/70">{error}</p>
            <button
              onClick={() => submit(vibe)}
              className="mt-3 rounded-lg brut-soft bg-acid px-4 py-2 text-sm font-bold uppercase"
            >
              Try again
            </button>
          </div>
        )}

        {/* RESULTS */}
        {picks && picks.length > 0 && (
          <>
            {summary && (
              <div className="mt-10 rounded-2xl bg-acid p-5 brut">
                <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
                  AI heard you say
                </div>
                <p className="serif-italic mt-1 text-2xl">"{summary}"</p>
              </div>
            )}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {picks.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/${p.mediaType}/${p.id}`}
                  className="poster-card group block fade-up"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl brut">
                    {p.poster ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={IMG.poster(p.poster, "w500") || ""}
                        alt={p.title}
                        loading="lazy"
                        className="poster-img absolute inset-0 h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center bg-cobalt p-4 text-center text-sm font-bold text-cream">
                        {p.title}
                      </div>
                    )}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-transparent opacity-0 transition group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition group-hover:opacity-100">
                      <p className="line-clamp-3 text-xs leading-snug text-cream">{p.why}</p>
                    </div>
                  </div>
                  <h3 className="mt-3 line-clamp-1 font-bold leading-tight">{p.title}</h3>
                  <p className="mt-0.5 text-xs font-medium text-ink/55">
                    {p.year} ·{" "}
                    <span className="uppercase tracking-wider">
                      {p.mediaType === "tv" ? "Series" : "Film"}
                    </span>
                  </p>
                </Link>
              ))}
            </div>
            <button
              onClick={() => {
                setPicks(null);
                setVibe("");
              }}
              className="mt-10 inline-flex items-center gap-2 rounded-xl brut-soft bg-cream px-5 py-3 text-sm font-bold uppercase"
            >
              Try another vibe
            </button>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
