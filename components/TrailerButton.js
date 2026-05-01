// CineTales — TrailerButton.
// Capsule-shaped, accent-colored, animated "Watch Trailer" CTA.
// Lives in detail page action rows beside Mark Watched / Watchlist.
//
// • If a TMDB trailer exists → opens the inline TrailerModal (no login).
// • If no TMDB trailer → opens a YouTube search in a new tab as fallback.

import { useState } from "react";
import TrailerModal from "./TrailerModal";

export default function TrailerButton({ trailer, title, year }) {
  const [open, setOpen] = useState(false);

  const onClick = () => {
    if (trailer?.key) {
      setOpen(true);
    } else {
      const q = encodeURIComponent(`${title} ${year || ""} official trailer`);
      window.open(
        `https://www.youtube.com/results?search_query=${q}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <>
      <button
        onClick={onClick}
        aria-label={`Watch ${title} trailer`}
        className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white bg-accent border border-accent hover:bg-accent-hover btn-press overflow-hidden group whitespace-nowrap"
        style={{ boxShadow: "0 0 24px -6px var(--accent-glow)" }}
      >
        {/* Animated shimmer sweep */}
        <span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out pointer-events-none"
        />

        {/* Pulsing dot ring */}
        <span
          aria-hidden
          className="relative grid place-items-center w-5 h-5 rounded-full bg-white/20"
        >
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="ml-0.5 relative"
            aria-hidden
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>

        <span className="relative">Watch Trailer</span>
      </button>

      {open && trailer?.key && (
        <TrailerModal
          youtubeKey={trailer.key}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
