// CineTales — MovieCard. 2:3 poster, purple score badge, hover overlay,
// type chip, optional rank.

import Link from "next/link";
import Image from "next/image";
import { posterUrl, getTitle, getYear } from "../lib/tmdb";

export default function MovieCard({ item, priority = false, rank = null }) {
  const id = item.id;
  const type = item.media_type === "tv" ? "tv" : "movie";
  const title = getTitle(item);
  const year = getYear(item);
  const poster = posterUrl(item.poster_path, "w342");
  const score = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null;

  return (
    <Link href={`/${type}/${id}`} className="group block relative card-hover">
      <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-surface border border-border">
        {poster ? (
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            priority={priority}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center p-3 text-text-3">
            <div>
              <FilmIcon />
              <p className="mt-2 text-xs">{title}</p>
            </div>
          </div>
        )}

        {/* Type chip */}
        <span className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-10 bg-bg/75 backdrop-blur text-[9px] md:text-[10px] font-mono uppercase tracking-widest text-text-1 px-1.5 md:px-2 py-0.5 md:py-1 rounded-md border border-border-light/50">
          {type === "tv" ? "Series" : "Film"}
        </span>

        {/* Rank (optional) */}
        {rank !== null && (
          <span className="absolute bottom-2 left-2 z-10 bg-accent text-white text-xs font-mono font-medium w-6 h-6 grid place-items-center rounded-full">
            {rank}
          </span>
        )}

        {/* Score badge */}
        {score !== null && (
          <span
            className="absolute top-1.5 right-1.5 md:top-2 md:right-2 z-10 bg-accent text-white text-[11px] md:text-xs font-mono font-medium px-1.5 md:px-2 py-0.5 md:py-1 rounded-md"
            style={{ boxShadow: "0 4px 16px -4px var(--accent-glow)" }}
          >
            {score.toFixed(1)}
          </span>
        )}

        {/* Hover overlay — desktop only (mobile already shows title below) */}
        <div className="hidden md:block absolute inset-x-0 bottom-0 z-10 p-3 bg-gradient-to-t from-bg via-bg/80 to-transparent translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-display text-base leading-tight line-clamp-2">
            {title}
          </p>
          {year && (
            <p className="font-mono text-[10px] text-text-3 mt-1">{year}</p>
          )}
        </div>
      </div>

      {/* Always-visible title under card */}
      <div className="mt-2 px-0.5">
        <p className="text-[13px] md:text-sm text-text-1 line-clamp-1 group-hover:text-accent transition-colors">
          {title}
        </p>
        {year && (
          <p className="font-mono text-[10px] text-text-3 mt-0.5">{year}</p>
        )}
      </div>
    </Link>
  );
}

function FilmIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mx-auto opacity-60"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7 3v18M17 3v18M3 8h4M3 16h4M17 8h4M17 16h4" />
    </svg>
  );
}
