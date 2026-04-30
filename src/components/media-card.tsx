import Link from "next/link";
import { IMG, getTitle, getYear, type TmdbMedia } from "@/lib/tmdb";
import { Star } from "lucide-react";

export function MediaCard({ item, priority = false }: { item: TmdbMedia; priority?: boolean }) {
  const mediaType = item.media_type === "tv" || (!item.media_type && item.name) ? "tv" : "movie";
  const poster = IMG.poster(item.poster_path, "w500");
  const title = getTitle(item);
  const year = getYear(item);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  return (
    <Link href={`/${mediaType}/${item.id}`} className="poster-card group block">
      <div className="relative aspect-[2/3] overflow-hidden rounded-2xl brut">
        {poster ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={poster}
            alt={title}
            loading={priority ? "eager" : "lazy"}
            className="poster-img absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-cobalt p-4 text-center font-bold text-cream">
            {title}
          </div>
        )}

        {rating && (
          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-acid px-2 py-1 text-xs font-bold brut-soft">
            <Star size={11} fill="currentColor" />
            {rating}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3 opacity-0 transition-all duration-500 group-hover:opacity-100">
          <p className="line-clamp-2 text-xs font-bold text-cream">{title}</p>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="line-clamp-1 font-bold leading-tight">{title}</h3>
        <p className="mt-0.5 text-xs font-medium text-ink/55">
          {year} · <span className="uppercase tracking-wider">{mediaType === "tv" ? "Series" : "Film"}</span>
        </p>
      </div>
    </Link>
  );
}
