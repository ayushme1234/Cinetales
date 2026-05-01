// CineTales — /match (AI Match flagship feature).
// Two inputs (Title A + Title B) → Groq generates 5 picks that bridge them.
// Each pick is enriched with TMDB poster, backdrop, score.

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RatingBadge from "../components/RatingBadge";

const PRESETS = [
  { a: "The Grand Budapest Hotel", b: "Drive" },
  { a: "Inception", b: "Eternal Sunshine of the Spotless Mind" },
  { a: "Spirited Away", b: "Pan's Labyrinth" },
  { a: "Breaking Bad", b: "Better Call Saul" },
  { a: "Whiplash", b: "Black Swan" },
];

export default function MatchPage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function submit(e) {
    if (e) e.preventDefault();
    if (!a.trim() || !b.trim() || loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/ai-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleA: a.trim(), titleB: b.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setResult(data);
    } catch (e) {
      setError("Something broke. Try again with different titles.");
    } finally {
      setLoading(false);
    }
  }

  function applyPreset(p) {
    setA(p.a);
    setB(p.b);
  }

  return (
    <>
      <Head>
        <title>AI Match — CineTales</title>
        <meta
          name="description"
          content="Tell us two titles you loved. Our AI finds five films that bridge them — tonally, thematically, stylistically."
        />
      </Head>
      <Navbar />
      <main className="min-h-screen pt-24 pb-24 purple-wash-top relative overflow-hidden">
        <div aria-hidden className="absolute inset-x-0 top-0 h-[70vh] grid-bg opacity-30 pointer-events-none" />
        <div aria-hidden className="absolute inset-0 grain pointer-events-none opacity-20" />

        <div className="container-x relative">
          {/* Header */}
          <header className="mb-12 max-w-3xl animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">
              ✦ AI Match · powered by groq
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-text-1 leading-[0.95]">
              Two films you love.
              <br />
              <span className="text-accent">One that bridges them.</span>
            </h1>
            <p className="mt-5 text-text-2 text-base md:text-lg max-w-2xl">
              Drop two titles you loved. We&rsquo;ll find five films that sit tonally
              between them — capturing what made each one special.
            </p>
          </header>

          {/* Input form */}
          <form onSubmit={submit} className="max-w-3xl">
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-stretch">
              <input
                value={a}
                onChange={(e) => setA(e.target.value)}
                placeholder="Title A — something you loved"
                className="bg-surface border border-border-light rounded-2xl px-5 py-4 text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none text-base"
              />

              <div className="hidden md:grid place-items-center text-accent">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="8" cy="16" r="4" />
                  <circle cx="24" cy="16" r="4" />
                  <path d="M12 16h8" />
                </svg>
              </div>
              <div className="md:hidden text-center text-accent text-sm font-mono">↓ ✦ ↓</div>

              <input
                value={b}
                onChange={(e) => setB(e.target.value)}
                placeholder="Title B — something else you loved"
                className="bg-surface border border-border-light rounded-2xl px-5 py-4 text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none text-base"
              />
            </div>

            <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex flex-wrap gap-2">
                {PRESETS.slice(0, 3).map((p, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-text-2 hover:border-accent hover:text-accent btn-press"
                  >
                    {p.a} × {p.b}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={!a.trim() || !b.trim() || loading}
                className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover btn-press disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Bridging…" : "Find the bridge →"}
              </button>
            </div>
          </form>

          {/* Loading state */}
          {loading && (
            <div className="mt-16 max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.25em] text-text-3 mb-5">
                // analyzing the bridge…
              </p>
              <div className="space-y-3">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 rounded-2xl shimmer" />
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-10 max-w-2xl bg-surface border border-skip/30 rounded-xl p-5">
              <p className="text-skip text-sm">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && (
            <section className="mt-16 max-w-5xl animate-fade-in">
              {result.bridge_summary && (
                <div className="mb-10 rounded-2xl bg-surface border border-accent/30 p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-dim blur-3xl pointer-events-none" />
                  <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-2 relative">
                    ✦ The Thread
                  </p>
                  <p className="font-display text-2xl md:text-3xl text-text-1 leading-snug relative">
                    {result.bridge_summary}
                  </p>
                </div>
              )}

              <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-6">
                // five bridge picks
              </p>

              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                {(result.recommendations || []).map((r, i) => {
                  const isMovie = (r.media_type || r.type) !== "tv";
                  const href = r.tmdb_id
                    ? `/${isMovie ? "movie" : "tv"}/${r.tmdb_id}`
                    : null;

                  const Card = (
                    <article className="group flex gap-4 bg-surface border border-border rounded-xl p-4 hover:border-border-light card-hover h-full">
                      <div className="relative shrink-0 w-24 md:w-28 aspect-[2/3] rounded-md overflow-hidden bg-elevated border border-border">
                        {r.poster_url ? (
                          <Image
                            src={r.poster_url}
                            alt={r.title}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 grid place-items-center text-text-3 text-[10px] text-center px-2">
                            No poster
                          </div>
                        )}
                        {typeof r.vote_average === "number" && r.vote_average > 0 && (
                          <div className="absolute top-1.5 right-1.5">
                            <RatingBadge score={r.vote_average} size="sm" />
                          </div>
                        )}
                        <div className="absolute top-1.5 left-1.5 bg-bg/80 backdrop-blur text-mono text-[10px] text-accent px-1.5 py-0.5 rounded">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <h3 className="font-display text-xl text-text-1 leading-tight">
                            {r.title}
                          </h3>
                          {r.year && (
                            <span className="text-mono text-xs text-text-3">{r.year}</span>
                          )}
                        </div>
                        <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full border border-border text-[10px] uppercase tracking-wider text-text-2">
                          {isMovie ? "Film" : "Series"}
                        </span>
                        {r.reason && (
                          <p className="mt-3 text-sm text-text-2 leading-relaxed">
                            <span className="text-accent">→ </span>
                            {r.reason}
                          </p>
                        )}
                      </div>
                    </article>
                  );

                  return href ? (
                    <Link key={`${r.title}-${i}`} href={href} className="block">
                      {Card}
                    </Link>
                  ) : (
                    <div key={`${r.title}-${i}`}>{Card}</div>
                  );
                })}
              </div>

              <div className="mt-10 text-center">
                <button
                  onClick={() => {
                    setResult(null);
                    setA("");
                    setB("");
                  }}
                  className="px-6 py-3 rounded-full border border-border-light text-text-1 hover:border-accent hover:text-accent btn-press"
                >
                  Try another bridge
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
