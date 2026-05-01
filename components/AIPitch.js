// CineTales — AIPitch component.
// Click-to-generate: user must tap the button to fetch a 3-bullet
// spoiler-free AI pitch from /api/ai-pitch. No auto-fetch on mount —
// keeps Groq API usage low.

import { useState } from "react";

export default function AIPitch({ title, year, overview, genres = [], type = "movie" }) {
  const [loading, setLoading] = useState(false);
  const [bullets, setBullets] = useState(null);
  const [error, setError] = useState("");

  async function generate() {
    if (loading || bullets) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, year, overview, genres, type }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setBullets(data.bullets || []);
    } catch (e) {
      setError("Couldn't generate. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl md:rounded-3xl bg-surface border border-accent/30 p-5 md:p-7 relative overflow-hidden">
      {/* Animated accent corners + glow ring */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-accent-dim blur-3xl pointer-events-none animate-pulse-slow" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
      />

      <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4 md:mb-5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] md:text-[11px] uppercase tracking-widest2 text-accent mb-1.5 flex items-center gap-1.5">
            <span className="relative grid place-items-center w-3 h-3">
              <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
              <span className="relative">✦</span>
            </span>
            CineAI Pitch
          </p>
          <h3 className="font-display text-xl md:text-2xl text-text-1 leading-tight">
            Why watch this?
          </h3>
          <p className="text-xs md:text-sm text-text-3 mt-1">
            Tap below for a spoiler-free 3-bullet take.
          </p>
        </div>

        {/* Generate button — only shown before first generation */}
        {!bullets && !loading && !error && (
          <button
            onClick={generate}
            className="relative shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover btn-press overflow-hidden group whitespace-nowrap self-start"
            style={{ boxShadow: "0 0 24px -6px var(--accent-glow)" }}
          >
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out pointer-events-none"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="relative" aria-hidden>
              <path d="M12 1.5l2.2 6.6 6.6 2.2-6.6 2.2L12 19.1l-2.2-6.6L3.2 10.3l6.6-2.2L12 1.5z" />
            </svg>
            <span className="relative">Generate</span>
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-3 relative">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-accent/40 font-mono shrink-0 mt-0.5">→</span>
              <div
                className="h-4 rounded shimmer flex-1"
                style={{ width: `${88 - i * 6}%` }}
              />
            </div>
          ))}
          <p className="font-mono text-[10px] text-text-3 pt-1">
            Asking the AI…
          </p>
        </div>
      )}

      {error && !loading && (
        <div className="relative">
          <p className="text-sm text-skip mb-2">{error}</p>
          <button
            onClick={generate}
            className="text-xs text-accent hover:text-accent-hover underline-offset-4 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && bullets && bullets.length > 0 && (
        <ul className="relative space-y-3 animate-fade-in">
          {bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm md:text-base text-text-1 leading-relaxed"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className="text-accent font-mono shrink-0 mt-0.5 text-base md:text-lg">→</span>
              <span>{b}</span>
            </li>
          ))}
          <p className="font-mono text-[10px] text-text-3 pt-3 border-t border-border mt-4">
            Generated by Groq · llama-3.3-70b · spoiler-free
          </p>
        </ul>
      )}
    </div>
  );
}
