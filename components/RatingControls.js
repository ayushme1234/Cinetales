// CineTales — RatingControls with 4 verdict tiers (Moctale-style).
// Skip · Timepass · Go For It · Perfection. Plus 0-10 precise score slider.
// Auto-saves on change. Sign-in CTA for unauthed users.

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

const TIERS = [
  { key: "skip",       label: "Skip",       short: "Skip",       icon: "✗", color: "var(--skip)" },
  { key: "mid",        label: "Timepass",   short: "Timepass",   icon: "—", color: "var(--mid)" },
  { key: "go",         label: "Go For It",  short: "Go For It",  icon: "✓", color: "var(--go)" },
  { key: "perfection", label: "Perfection", short: "Perfection", icon: "★", color: "var(--perfection)" },
];

export default function RatingControls({ mediaId, mediaType, title, posterPath }) {
  const { data: session, status } = useSession();
  const [vibe, setVibe] = useState(null);
  const [score, setScore] = useState(7.0);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancel = false;
    fetch(`/api/ratings?mediaId=${mediaId}&mediaType=${mediaType}`)
      .then((r) => r.json())
      .then((row) => {
        if (cancel) return;
        if (row) {
          setVibe(row.vibe || null);
          if (row.score !== null && row.score !== undefined) setScore(Number(row.score));
        }
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [status, mediaId, mediaType]);

  const save = async (newVibe = vibe, newScore = score) => {
    if (status !== "authenticated") return;
    setSaving(true);
    try {
      const res = await fetch(`/api/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId,
          mediaType,
          score: newScore,
          vibe: newVibe,
          title,
          posterPath,
        }),
      });
      if (res.ok) setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return <div className="h-48 rounded-2xl shimmer" />;
  }

  if (status === "unauthenticated") {
    return (
      <div className="rounded-2xl bg-surface border border-border p-6 md:p-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-text-3 mb-3">
          Your Rating
        </p>
        <p className="text-text-2 mb-5">
          Sign in to rate this title and keep track of what you&rsquo;ve watched.
        </p>
        <button
          onClick={() =>
            signIn("google", {
              callbackUrl:
                typeof window !== "undefined" ? window.location.pathname : "/",
            })
          }
          className="inline-flex items-center gap-2 bg-accent text-white font-medium px-5 py-2.5 rounded-full btn-press hover:bg-accent-hover"
        >
          Sign in to rate
        </button>
      </div>
    );
  }

  const sliderProgress = `${(score / 10) * 100}%`;

  return (
    <div className="rounded-2xl bg-surface border border-border p-6 md:p-8">
      <div className="flex items-center justify-between mb-5">
        <p className="font-mono text-[10px] uppercase tracking-widest2 text-text-3">
          Your Verdict
        </p>
        {saving ? (
          <span className="font-mono text-xs text-accent animate-pulse">Saving…</span>
        ) : savedAt ? (
          <span className="font-mono text-xs text-go">✓ Saved</span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {TIERS.map((t) => {
          const active = vibe === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                const next = active ? null : t.key;
                setVibe(next);
                save(next, score);
              }}
              className="flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border transition-all btn-press"
              style={{
                background: active ? t.color : "var(--elevated)",
                borderColor: active ? t.color : "var(--border)",
                color: active ? "#0a0710" : "var(--text-1)",
              }}
            >
              <span className="text-xl font-mono">{t.icon}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider">
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest2 text-text-3">
            Precise Score
          </span>
          <span className="font-mono text-lg text-accent">
            {Number(score).toFixed(1)}
            <span className="text-text-3 text-xs ml-1">/ 10</span>
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
          onMouseUp={(e) => save(vibe, Number(e.target.value))}
          onTouchEnd={(e) => save(vibe, Number(e.target.value))}
          style={{ "--val": sliderProgress }}
          className="w-full"
        />
        <div className="flex justify-between mt-1 text-[10px] font-mono text-text-3">
          <span>0</span>
          <span>2.5</span>
          <span>5</span>
          <span>7.5</span>
          <span>10</span>
        </div>
      </div>
    </div>
  );
}
