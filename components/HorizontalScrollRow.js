// CineTales — HorizontalScrollRow.
// Spotify-style row: title + optional subtitle, snap-scroll with arrow controls
// on desktop, no scrollbar. Cards via MovieCard.

import Link from "next/link";
import { useRef } from "react";
import MovieCard from "./MovieCard";

export default function HorizontalScrollRow({
  title,
  subtitle,
  label,
  items = [],
  href,
  seeAllHref,
  forceType,
  type,
}) {
  const ref = useRef(null);
  const linkHref = href || seeAllHref;
  const cardType = forceType || type;

  const scroll = (dir) => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({ left: dir * w * 0.85, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mt-8 md:mt-16">
      <div className="flex items-end justify-between mb-6 gap-4">
        <div className="min-w-0">
          {label && (
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-2">
              // {label}
            </p>
          )}
          <h2 className="font-display text-2xl md:text-4xl leading-tight">{title}</h2>
          {subtitle && (
            <p className="text-sm text-text-3 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {linkHref && (
            <Link
              href={linkHref}
              className="hidden md:inline-flex text-sm text-text-2 hover:text-accent transition items-center gap-1"
            >
              See all
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          )}
          <div className="hidden md:flex gap-1.5">
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 grid place-items-center rounded-full border border-border hover:border-accent hover:text-accent btn-press"
              aria-label="Scroll left"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 grid place-items-center rounded-full border border-border hover:border-accent hover:text-accent btn-press"
              aria-label="Scroll right"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="no-scrollbar overflow-x-auto scroll-smooth snap-x"
      >
        <div className="flex gap-3 md:gap-4 pb-2">
          {items.map((m, i) => (
            <div
              key={`${m.id}-${i}`}
              className="snap-start shrink-0 w-[42vw] sm:w-[28vw] md:w-[180px] lg:w-[200px]"
            >
              <MovieCard
                item={cardType ? { ...m, media_type: cardType } : m}
                priority={i < 3}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
