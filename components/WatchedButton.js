// CineTales — WatchedButton.
// Moctale-style green "Watched" toggle that lives in the detail page hero.
// Marking watched auto-adds the title to the watchlist with watched=true,
// so users can declare "I've seen this" without an explicit Watchlist click.

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

export default function WatchedButton({ mediaId, mediaType, title, posterPath }) {
  const { data: session, status } = useSession();
  const [watched, setWatched] = useState(false);
  const [inList, setInList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancel = false;
    fetch(`/api/watchlist`)
      .then((r) => r.json())
      .then((rows) => {
        if (cancel) return;
        const row = (rows || []).find(
          (r) => r.media_id === Number(mediaId) && r.media_type === mediaType
        );
        if (row) {
          setInList(true);
          setWatched(!!row.watched);
        }
      })
      .catch(() => {});
    return () => { cancel = true; };
  }, [status, mediaId, mediaType]);

  const onClick = async () => {
    if (status !== "authenticated") {
      signIn("google", {
        callbackUrl:
          typeof window !== "undefined" ? window.location.pathname : "/",
      });
      return;
    }
    setLoading(true);
    try {
      if (!inList) {
        // Insert + mark watched in one step
        const r = await fetch(`/api/watchlist`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, mediaType, title, posterPath, watched: true }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          alert(`Couldn't mark watched: ${d.error || r.status}`);
          return;
        }
        setInList(true);
        setWatched(true);
      } else {
        const newWatched = !watched;
        const r = await fetch(`/api/watchlist`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId, mediaType, watched: newWatched }),
        });
        if (!r.ok) {
          const d = await r.json().catch(() => ({}));
          alert(`Couldn't update: ${d.error || r.status}`);
          return;
        }
        setWatched(newWatched);
      }
    } catch (e) {
      alert(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const base =
    "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium border transition-all btn-press whitespace-nowrap";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        watched
          ? `${base} bg-go text-black border-go hover:opacity-90`
          : `${base} bg-surface border-border-light text-text-1 hover:border-go hover:text-go`
      }
      aria-pressed={watched}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {watched ? (
          <path d="M20 6 9 17l-5-5" />
        ) : (
          <>
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </>
        )}
      </svg>
      {loading ? "…" : watched ? "Watched" : "Mark Watched"}
    </button>
  );
}
