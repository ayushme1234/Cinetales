// CineTales — /trending page.
// Week / Today tabs. Editorial ranked layout with giant rank numbers behind cards.

import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RatingBadge from "../components/RatingBadge";
import { getTrending, posterUrl, getTitle, getYear } from "../lib/tmdb";

export default function TrendingPage({ week, today }) {
  const [tab, setTab] = useState("week");
  const items = (tab === "week" ? week : today).filter(
    (m) => m.media_type === "movie" || m.media_type === "tv"
  );

  return (
    <>
      <Head>
        <title>Trending — CineTales</title>
        <meta name="description" content="What everyone's watching right now. The most-talked-about films and series this week and today." />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24">
        <div className="container-x">
          <header className="mb-12 max-w-3xl animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent/70 mb-3">// hot right now</p>
            <h1 className="font-display text-5xl md:text-6xl text-text-1 leading-[0.95]">Trending</h1>
            <p className="mt-4 text-text-2 text-base md:text-lg">
              The most-talked-about films and series. Updated daily.
            </p>
          </header>

          <div className="mb-10 inline-flex bg-surface border border-border rounded-full p-1">
            {[
              { v: "week", l: "This Week" },
              { v: "today", l: "Today" },
            ].map((opt) => (
              <button
                key={opt.v}
                onClick={() => setTab(opt.v)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition btn-press ${
                  tab === opt.v ? "bg-accent text-white" : "text-text-2 hover:text-text-1"
                }`}
              >
                {opt.l}
              </button>
            ))}
          </div>

          <ol className="space-y-3 md:space-y-4">
            {items.slice(0, 20).map((item, i) => {
              const rank = String(i + 1).padStart(2, "0");
              const title = getTitle(item);
              const year = getYear(item);
              const href = item.media_type === "tv" ? `/tv/${item.id}` : `/movie/${item.id}`;
              const poster = posterUrl(item.poster_path, "w154");
              return (
                <li key={`${item.media_type}-${item.id}`} className="group relative">
                  <Link
                    href={href}
                    className="relative flex items-center gap-4 md:gap-6 px-4 md:px-6 py-4 md:py-5 bg-surface border border-border rounded-xl hover:border-border-light transition overflow-hidden"
                  >
                    {/* Giant rank number */}
                    <span
                      aria-hidden
                      className="font-mono text-[5rem] md:text-[8rem] leading-none text-elevated select-none shrink-0 w-16 md:w-32 text-right group-hover:text-[#222] transition"
                    >
                      {rank}
                    </span>

                    {/* Poster */}
                    <div className="relative shrink-0 w-16 h-24 md:w-20 md:h-28 rounded-md overflow-hidden bg-elevated border border-border">
                      {poster ? (
                        <Image
                          src={poster}
                          alt={title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-text-3 text-xs">No image</div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-xl md:text-2xl text-text-1 truncate">{title}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-text-2">
                        <span className="text-mono">{year || "—"}</span>
                        <span className="text-text-3">·</span>
                        <span className="px-2 py-0.5 rounded-full border border-border text-[10px] uppercase tracking-wider">
                          {item.media_type === "tv" ? "Series" : "Film"}
                        </span>
                      </div>
                      {item.overview && (
                        <p className="mt-2 hidden md:block text-sm text-text-2 line-clamp-2 max-w-2xl">
                          {item.overview}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <RatingBadge score={item.vote_average} size="md" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function getServerSideProps(ctx) {
  try {
    const [w, d] = await Promise.all([
      getTrending("week"),
      getTrending("day"),
    ]);
    ctx.res.setHeader("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    return {
      props: {
        week: w.results || [],
        today: d.results || [],
      },
    };
  } catch (err) {
    console.error("trending ssr:", err);
    return { props: { week: [], today: [] } };
  }
}
