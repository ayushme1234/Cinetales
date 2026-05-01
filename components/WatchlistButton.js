import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

export default function WatchlistButton({ mediaId, mediaType, title, posterPath }) {
  const { data: session, status } = useSession();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancel = false;
    fetch(`/api/watchlist`)
      .then((r) => r.json())
      .then((rows) => {
        if (cancel) return;
        const has = (rows || []).some(
          (r) => r.media_id === Number(mediaId) && r.media_type === mediaType
        );
        setAdded(has);
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [status, mediaId, mediaType]);

  const onClick = async () => {
    if (status !== "authenticated") {
      signIn("google", { callbackUrl: typeof window !== "undefined" ? window.location.pathname : "/" });
      return;
    }
    setLoading(true);
    try {
      if (added) {
        await fetch(`/api/watchlist`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, mediaType }),
        });
        setAdded(false);
      } else {
        await fetch(`/api/watchlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, mediaType, title, posterPath }),
        });
        setAdded(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all btn-press";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        added
          ? `${base} bg-[var(--accent)] text-white border-[var(--accent)]`
          : `${base} border-[var(--border-light)] text-[var(--text-1)] hover:border-[var(--accent)] hover:text-[var(--accent)]`
      }
      aria-pressed={added}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill={added ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
      {loading ? "..." : added ? "In Watchlist" : "Watchlist"}
    </button>
  );
}
