// CineTales — /vibes page (VibesAI).
// Big prompt input, example chips, /api/vibes call, results grid with AI reasons.

import { useState, useRef } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RatingBadge from "../components/RatingBadge";
import { posterUrl } from "../lib/tmdb";

const EXAMPLE_PROMPTS = [
  "rainy day comfort watch",
  "movies that absolutely destroyed me emotionally",
  "feel good anime to watch with friends",
  "something mysterious and slow-burn",
  "action that doesn't make you think too hard",
  "underrated films from the 90s",
  "neon-soaked cyberpunk vibes",
  "small-town stories that feel big",
];

export default function VibesPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function submit(text) {
    const value = (text ?? prompt).trim();
    if (!value || loading) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch("/api/vibes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResults(data.recommendations || []);
    } catch (e) {
      console.error(e);
      setError("Something went wrong. Try a different vibe.");
    } finally {
      setLoading(false);
    }
  }

  function pickExample(text) {
    setPrompt(text);
    inputRef.current?.focus();
  }

  return (
    <>
      <Head>
        <title>VibesAI — CineTales</title>
        <meta
          name="description"
          content="Describe a mood. We'll find the perfect film. AI-powered recommendations from Groq + Llama."
        />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24 relative overflow-hidden">
        {/* Subtle backdrop ambience */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-[60vh] grid-bg opacity-40 pointer-events-none" />
        <div aria-hidden className="absolute inset-0 grain pointer-events-none opacity-30" />

        <div className="container-x relative">
          <header className="mb-10 max-w-3xl animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent/70 mb-3">
              // vibes ai · powered by groq
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-text-1 leading-[0.95]">
              Describe a vibe.
            </h1>
            <p className="mt-5 text-text-2 text-base md:text-lg max-w-xl">
              Tell us how you want to feel. We&rsquo;ll find the perfect film.
            </p>
          </header>

          {/* Input */}
          <div className="max-w-3xl">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                rows={3}
                placeholder="rainy day, melancholic, something slow…"
                className="w-full bg-surface border border-border-light rounded-2xl px-5 py-4 text-text-1 text-base md:text-lg placeholder:text-text-3 focus:border-accent focus:outline-none resize-none"
              />
              <button
                onClick={() => submit()}
                disabled={loading || !prompt.trim()}
                className="absolute right-3 bottom-3 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium btn-press hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Finding…" : "Find films →"}
              </button>
            </div>

            {/* Example chips */}
            <div className="mt-5">
              <p className="text-mono text-[11px] uppercase tracking-[0.2em] text-text-3 mb-3">
                // try a vibe
              </p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => pickExample(ex)}
                    className="px-3 py-1.5 rounded-full bg-surface border border-border text-text-2 text-xs hover:border-accent hover:text-accent transition btn-press"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-16 flex flex-col items-center text-center">
              <div className="flex gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: "300ms" }} />
              </div>
              <p className="mt-4 text-text-2 text-sm">Finding your perfect matches…</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-10 max-w-2xl bg-surface border border-skip/30 rounded-xl p-5">
              <p className="text-skip text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && results.length > 0 && (
            <section className="mt-16">
              <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent/70 mb-3">// results</p>
              <h2 className="font-display text-3xl md:text-4xl text-text-1 mb-8">
                {results.length} films for that vibe
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {results.map((r, idx) => {
                  const enriched = r.enriched || null;
                  const hasTmdb = enriched && (enriched.id || r.tmdb_id);
                  const id = enriched?.id || r.tmdb_id;
                  const type = enriched?.media_type || r.type || "movie";
                  const href = hasTmdb ? (type === "tv" ? `/tv/${id}` : `/movie/${id}`) : null;
                  const poster = enriched?.poster_path ? posterUrl(enriched.poster_path, "w342") : null;
                  const score = enriched?.vote_average;

                  const Card = (
                    <div className="group flex gap-4 bg-surface border border-border rounded-xl p-4 hover:border-border-light transition card-hover h-full">
                      <div className="relative shrink-0 w-24 md:w-28 aspect-[2/3] rounded-md overflow-hidden bg-elevated border border-border">
                        {poster ? (
                          <Image src={poster} alt={r.title} fill sizes="112px" className="object-cover" />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-text-3 text-xs text-center px-2">
                            No poster
                          </div>
                        )}
                        {typeof score === "number" && score > 0 && (
                          <div className="absolute top-1.5 right-1.5">
                            <RatingBadge score={score} size="sm" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-display text-xl text-text-1 leading-tight">{r.title}</h3>
                          {r.year && <span className="text-mono text-xs text-text-3">{r.year}</span>}
                        </div>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full border border-border text-[10px] uppercase tracking-wider text-text-2">
                          {type === "tv" ? "Series" : "Film"}
                        </span>
                        {r.reason && (
                          <p className="mt-3 text-sm text-text-2 leading-relaxed">
                            <span className="text-accent">→ </span>
                            {r.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  );

                  return href ? (
                    <Link key={`${r.title}-${idx}`} href={href} className="block">
                      {Card}
                    </Link>
                  ) : (
                    <div key={`${r.title}-${idx}`}>{Card}</div>
                  );
                })}
              </div>
            </section>
          )}

          {results && results.length === 0 && !loading && (
            <div className="mt-16 max-w-2xl">
              <p className="text-text-2">No matches came back. Try a different vibe.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
