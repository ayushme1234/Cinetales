// CineTales — Homepage.
// Moctale-style hero with scrolling poster walls behind a giant logo + tagline.
// Spotify-style horizontal rows below. BookMyShow-style "Most Interested" rail.

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HorizontalScrollRow from "../components/HorizontalScrollRow";
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  posterUrl,
  getTitle,
  getYear,
} from "../lib/tmdb";

export default function HomePage({
  trending,
  popularMovies,
  popularTV,
  posterWall,
  mostInterested,
}) {
  return (
    <>
      <Head>
        <title>CineTales — Find tales that matter</title>
        <meta
          name="description"
          content="Discover, rate, and track films & series. AI-powered recommendations, where to stream, trailers — all in one place."
        />
      </Head>
      <Navbar />

      {/* ──── HERO — Moctale-style poster wall ─────────────── */}
      <section className="relative pt-16 pb-16 md:pb-24 overflow-hidden">
        {/* Poster walls — two rows scrolling in opposite directions */}
        <div className="absolute inset-x-0 top-0 bottom-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 purple-wash-top" />

          {/* Row 1 — top */}
          <div className="absolute top-24 inset-x-0 flex animate-marquee">
            {[...posterWall, ...posterWall].slice(0, 28).map((p, i) => (
              <PosterTile key={`r1-${i}`} src={p} index={i} />
            ))}
          </div>

          {/* Row 2 — bottom */}
          <div className="absolute bottom-12 inset-x-0 flex animate-marquee-reverse">
            {[...posterWall.slice().reverse(), ...posterWall.slice().reverse()].slice(0, 28).map((p, i) => (
              <PosterTile key={`r2-${i}`} src={p} index={i} />
            ))}
          </div>

          {/* Vignette overlays for legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/85 to-bg" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
        </div>

        {/* Hero content */}
        <div className="container-x relative z-10 min-h-[55vh] md:min-h-[60vh] flex flex-col items-center justify-center text-center pt-16 md:pt-32">
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.4em] text-accent mb-6 animate-fade-in">
            ✦ find tales that matter
          </p>

          <h1 className="font-display text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] leading-[0.9] text-text-1 max-w-5xl animate-slide-up">
            Cine<span className="text-accent">Tales</span>
          </h1>

          <p className="mt-6 max-w-2xl text-base md:text-xl text-text-2 leading-relaxed animate-slide-up">
            Discover films & series. Watch trailers. See where they&rsquo;re streaming.
            Rate them in 4 verdicts. Get AI picks for any vibe.
          </p>

          <div className="mt-10 flex flex-wrap gap-3 justify-center animate-slide-up">
            <Link
              href="/discover"
              className="px-7 py-3.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover btn-press text-base"
            >
              Start exploring →
            </Link>
            <Link
              href="/match"
              className="px-7 py-3.5 rounded-full bg-surface/80 backdrop-blur border border-border-light text-text-1 hover:border-accent hover:text-accent btn-press text-base"
            >
              ✦ Try AI Match
            </Link>
          </div>

          {/* Quick stat strip */}
          <div className="mt-12 flex items-center gap-6 md:gap-10 text-mono text-[10px] md:text-xs uppercase tracking-widest text-text-3 animate-fade-in">
            <span>500k+ titles</span>
            <span className="w-px h-4 bg-border" />
            <span>AI powered</span>
            <span className="w-px h-4 bg-border" />
            <span>spoiler-free</span>
          </div>
        </div>
      </section>

      <main className="bg-bg pb-24 relative">
        <div className="container-x">
          {/* ──── Trending row ─────────────────────────────── */}
          <HorizontalScrollRow
            title="Trending Now"
            subtitle="What everyone's watching this week"
            href="/trending"
            items={trending}
          />

          {/* ──── Popular Movies ───────────────────────────── */}
          <HorizontalScrollRow
            title="Popular Films"
            subtitle="Most-watched right now"
            href="/discover?type=movie"
            items={popularMovies}
            forceType="movie"
          />

          {/* ──── Most Interested rail (BookMyShow-style) ──── */}
          {mostInterested.length > 0 && (
            <section className="mt-16">
              <div className="flex items-baseline justify-between mb-6">
                <div>
                  <p className="text-mono text-[10px] uppercase tracking-widest2 text-hot mb-2">
                    🔥 most anticipated
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl">
                    Most Interested This Week
                  </h2>
                </div>
                <Link
                  href="/trending"
                  className="hidden md:block text-sm text-accent hover:text-accent-hover"
                >
                  See all →
                </Link>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {mostInterested.slice(0, 6).map((item, i) => {
                  const isMovie = item.media_type !== "tv";
                  return (
                    <Link
                      key={`mi-${item.id}`}
                      href={`/${isMovie ? "movie" : "tv"}/${item.id}`}
                      className="group flex items-center gap-4 px-4 py-3.5 bg-surface border border-border rounded-xl hover:border-border-light transition card-hover"
                    >
                      <span
                        aria-hidden
                        className="font-mono text-5xl text-elevated select-none shrink-0 w-12 text-right group-hover:text-text-3 transition"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="relative shrink-0 w-12 h-16 rounded-md overflow-hidden bg-elevated border border-border">
                        {item.poster_path && (
                          <Image
                            src={posterUrl(item.poster_path, "w154")}
                            alt={getTitle(item)}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-text-1 truncate group-hover:text-accent transition">
                          {getTitle(item)}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-text-3">
                          <span className="text-mono">{getYear(item) || "—"}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider border border-border">
                            {isMovie ? "Film" : "Series"}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-1 text-hot text-mono text-xs shrink-0">
                        <FlameIcon />
                        <span>{Math.round((item.popularity || 50) * 10)}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* ──── Popular TV ───────────────────────────────── */}
          <HorizontalScrollRow
            title="Top Series"
            subtitle="Binge-worthy shows"
            href="/discover?type=tv"
            items={popularTV}
            forceType="tv"
          />

          {/* ──── AI Features promo ────────────────────────── */}
          <section className="mt-20 grid md:grid-cols-2 gap-5">
            {/* VibesAI */}
            <Link
              href="/vibes"
              className="group relative rounded-2xl bg-surface border border-border p-7 md:p-9 overflow-hidden hover:border-accent transition card-hover"
            >
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-dim blur-3xl pointer-events-none group-hover:bg-accent-glow transition" />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
                  ✦ ai feature
                </p>
                <h3 className="font-display text-3xl md:text-4xl mb-3">
                  VibesAI
                </h3>
                <p className="text-text-2 mb-5 max-w-md">
                  Describe a mood. Get 8 films matched to it. Powered by Groq.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent group-hover:translate-x-1 transition">
                  Match your mood →
                </span>
              </div>
            </Link>

            {/* AI Match */}
            <Link
              href="/match"
              className="group relative rounded-2xl bg-surface border border-border p-7 md:p-9 overflow-hidden hover:border-accent transition card-hover"
            >
              <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-accent-dim blur-3xl pointer-events-none group-hover:bg-accent-glow transition" />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
                  ✦ new · ai feature
                </p>
                <h3 className="font-display text-3xl md:text-4xl mb-3">
                  AI Match
                </h3>
                <p className="text-text-2 mb-5 max-w-md">
                  Two films you loved → five that bridge them.
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-accent group-hover:translate-x-1 transition">
                  Find the bridge →
                </span>
              </div>
            </Link>
          </section>

          {/* ──── Verdict explainer ────────────────────────── */}
          <section className="mt-20 max-w-4xl mx-auto text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-text-3 mb-3">
              // four verdicts. one tap.
            </p>
            <h2 className="font-display text-3xl md:text-5xl mb-3">
              Rate films honestly.
            </h2>
            <p className="text-text-2 mb-10 max-w-2xl mx-auto">
              No more meaningless five-star averages. Pick a verdict that
              actually says something.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { k: "Skip", c: "var(--skip)", icon: "✗", desc: "Don't bother" },
                { k: "Timepass", c: "var(--mid)", icon: "—", desc: "Watchable" },
                { k: "Go For It", c: "var(--go)", icon: "✓", desc: "Worth it" },
                { k: "Perfection", c: "var(--perfection)", icon: "★", desc: "All-timer" },
              ].map((v) => (
                <div
                  key={v.k}
                  className="rounded-xl border border-border bg-surface p-5 hover:border-border-light transition card-hover"
                >
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center font-mono text-lg mb-3 mx-auto"
                    style={{ background: v.c, color: "#0a0710" }}
                  >
                    {v.icon}
                  </div>
                  <p className="font-medium text-text-1 mb-1">{v.k}</p>
                  <p className="text-xs text-text-3">{v.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Tilted poster tile in hero wall ───────────────────────────── */
function PosterTile({ src, index }) {
  // Slight rotation alternation for variety
  const rotate = (index % 5) * 1.5 - 3; // -3 to +3 deg
  return (
    <div
      className="shrink-0 mx-1.5 md:mx-3 relative w-[80px] h-[120px] md:w-[150px] md:h-[225px] rounded-lg overflow-hidden border border-border-light/50 shadow-2xl"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {src && (
        <Image
          src={src}
          alt=""
          fill
          sizes="150px"
          className="object-cover"
          loading={index < 8 ? "eager" : "lazy"}
        />
      )}
    </div>
  );
}

function FlameIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c-.5 4-3 5-3 8a3 3 0 0 0 3 3 3 3 0 0 0 3-3c0-1-.5-2-1-3 2 1 4 3 4 6a6 6 0 0 1-12 0c0-3 2-6 6-11z" />
    </svg>
  );
}

/* ─── SSR ──────────────────────────────────────────────────────── */
export async function getServerSideProps({ res }) {
  let trending = [];
  let popularMovies = [];
  let popularTV = [];
  let posterWall = [];
  let mostInterested = [];

  try {
    const [t, pm, pt] = await Promise.all([
      getTrending("week"),
      getPopularMovies(1),
      getPopularTV(1),
    ]);

    trending = (t.results || [])
      .filter((m) => m.media_type === "movie" || m.media_type === "tv")
      .slice(0, 18);
    popularMovies = (pm.results || []).slice(0, 18);
    popularTV = (pt.results || []).slice(0, 18);

    // Build poster wall — 30 unique posters from all sources
    const wallPool = [
      ...trending,
      ...popularMovies,
      ...popularTV,
    ].filter((x) => x.poster_path);
    const seen = new Set();
    posterWall = [];
    for (const item of wallPool) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      posterWall.push(posterUrl(item.poster_path, "w342"));
      if (posterWall.length >= 30) break;
    }

    // Most Interested — sort trending by popularity
    mostInterested = [...trending]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6);
  } catch (err) {
    console.error("Home SSR failed:", err);
  }

  if (res) {
    res.setHeader("Cache-Control", "public, s-maxage=900, stale-while-revalidate=1800");
  }

  return {
    props: {
      trending,
      popularMovies,
      popularTV,
      posterWall,
      mostInterested,
    },
  };
}
