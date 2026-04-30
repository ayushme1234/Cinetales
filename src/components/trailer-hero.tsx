"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, X } from "lucide-react";

interface Props {
  backdropUrl: string | null;
  trailerKey: string | null;
  title: string;
}

export function TrailerHero({ backdropUrl, trailerKey, title }: Props) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  // Esc to close + lock scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  if (!backdropUrl && !trailerKey) return null;

  return (
    <>
      <div className="group relative aspect-video overflow-hidden rounded-3xl brut">
        {backdropUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={backdropUrl}
            alt={`${title} backdrop`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center bg-cobalt p-6 text-center text-cream">
            {title}
          </div>
        )}

        {/* Dark gradient overlay for legibility */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />

        {/* TRAILER badge */}
        {trailerKey && (
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-electric px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-cream brut">
            <span className="h-2 w-2 animate-pulse rounded-full bg-acid" />
            Watch trailer
          </div>
        )}

        {/* Play button */}
        {trailerKey && (
          <button
            onClick={() => setOpen(true)}
            aria-label={`Play ${title} trailer`}
            className="play-btn absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-acid brut md:h-28 md:w-28"
          >
            <Play className="ml-1 fill-ink" size={36} />
          </button>
        )}

        {/* Title at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
          <h2 className="serif-italic text-3xl text-cream md:text-5xl">
            "{title}"
          </h2>
        </div>
      </div>

      {/* MODAL */}
      {open && trailerKey && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/85 backdrop-blur-strong p-4 scale-in"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close trailer"
            className="absolute right-5 top-5 grid h-12 w-12 place-items-center rounded-full bg-cream brut hover:bg-electric hover:text-cream"
          >
            <X size={22} />
          </button>

          <div
            className="relative aspect-video w-full max-w-5xl overflow-hidden rounded-2xl brut"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`}
              title={`${title} trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>
      )}
    </>
  );
}
