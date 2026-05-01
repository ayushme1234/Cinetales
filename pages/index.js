// CineTales — Homepage.
// Moctale-style hero with scrolling poster walls behind a giant logo + tagline.
// Spotify-style horizontal rows below. BookMyShow-style "Most Interested" rail.

import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import HorizontalScrollRow from "../components/HorizontalScrollRow";
import {
  getTrending,
  getPopularMovies,
  getPopularTV,
  getNowPlayingMovies,
  discoverMovies,
  discoverTV,
  posterUrl,
  getTitle,
  getYear,
} from "../lib/tmdb";
import { getRegionFromReq, getRegionInfo, REGIONS, setRegionClient } from "../lib/region";

export default function HomePage({
  region = "IN",
  regionMovies = [],
  regionTV = [],
  trending,
  popularMovies,
  popularTV,
  posterWall,
  mostInterested,
  nowPlaying = [],
  criticallyAcclaimed = [],
  hiddenGems = [],
}) {
  const { data: session, status } = useSession();
  const loggedOut = status === "unauthenticated";
  const regionInfo = getRegionInfo(region);

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
      {/* Mobile: vertical split — posters fill top 45vh, content fills bottom.
          Desktop: classic full-bleed with content overlay. */}
      <section className="relative pt-16 pb-0 overflow-hidden flex flex-col md:block min-h-[calc(100vh-4rem)] md:min-h-0">
        {/* MOBILE POSTER STAGE (top portion) — visible, less obscured.
            On desktop this same div absolute-positions over the whole hero. */}
        <div className="relative md:absolute md:inset-x-0 md:top-0 md:bottom-0 h-[30vh] md:h-auto pointer-events-none overflow-hidden">
          <div className="absolute inset-0 purple-wash-top" />

          {/* Row 1 — top */}
          <div className="absolute top-3 md:top-24 inset-x-0 flex animate-marquee">
            {[...posterWall, ...posterWall].slice(0, 28).map((p, i) => (
              <PosterTile key={`r1-${i}`} src={p} index={i} />
            ))}
          </div>

          {/* Row 2 — bottom */}
          <div className="absolute bottom-3 md:bottom-12 inset-x-0 flex animate-marquee-reverse">
            {[...posterWall.slice().reverse(), ...posterWall.slice().reverse()].slice(0, 28).map((p, i) => (
              <PosterTile key={`r2-${i}`} src={p} index={i} />
            ))}
          </div>

          {/* Mobile: only fade the bottom edge so posters stay vivid above.
              Desktop: full vignettes for legibility behind centered content. */}
          <div className="absolute inset-0 bg-gradient-to-b from-bg/0 via-transparent md:from-bg/40 md:via-bg/85 to-bg" />
          <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
          {/* Strong fade-to-bg at very bottom on mobile for clean handoff */}
          <div className="md:hidden absolute inset-x-0 bottom-0 h-20 bg-gradient-to-b from-transparent to-bg" />
        </div>

        {/* Hero content — bottom half on mobile, full overlay on desktop */}
        <div className="container-x relative z-10 flex-1 md:min-h-[70vh] flex flex-col items-center justify-start md:justify-center text-center pt-3 pb-6 md:py-16">
          {/* VibesAI promo badge — animated, replaces old taglines */}
          <Link
            href="/vibes"
            className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-dim border border-accent/30 hover:border-accent text-accent text-xs md:text-sm font-mono uppercase tracking-[0.2em] mb-3 md:mb-6 animate-fade-in btn-press transition-all hover:bg-accent/20"
          >
            <span className="relative grid place-items-center w-4 h-4">
              <span className="absolute inset-0 rounded-full bg-accent/40 animate-ping" />
              <span className="relative">✦</span>
            </span>
            <span>Now with VibesAI</span>
            <span className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition">→</span>
          </Link>

          <h1 className="font-display text-5xl sm:text-7xl md:text-9xl lg:text-[10rem] leading-[0.9] text-text-1 max-w-5xl animate-slide-up">
            Cine<span className="text-accent">Tales</span>
          </h1>

          <p className="mt-3 md:mt-6 max-w-2xl text-sm md:text-xl text-text-2 leading-relaxed animate-slide-up">
            Discover films & series. Watch trailers. See where they&rsquo;re streaming.
            Rate them in 4 verdicts. Get AI picks for any vibe.
          </p>

          {/* CTA cluster — VibesAI is the primary, others secondary */}
          <div className="mt-5 md:mt-10 flex flex-wrap gap-2.5 md:gap-3 justify-center animate-slide-up">
            <Link
              href="/vibes"
              className="relative inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-accent text-white font-medium hover:bg-accent-hover btn-press text-base overflow-hidden group"
              style={{ boxShadow: "0 0 32px -6px var(--accent-glow)" }}
            >
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[900ms] ease-out pointer-events-none"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="relative" aria-hidden>
                <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14zM5 15l.6 1.8L7.4 17.4 5.6 18l-.6 1.8-.6-1.8L2.6 17.4 4.4 16.8 5 15z" />
              </svg>
              <span className="relative">Try VibesAI</span>
            </Link>
            <Link
              href="/discover"
              className="px-7 py-3.5 rounded-full bg-surface/80 backdrop-blur border border-border-light text-text-1 hover:border-accent hover:text-accent btn-press text-base"
            >
              Discover
            </Link>
            <Link
              href="/match"
              className="px-7 py-3.5 rounded-full bg-surface/80 backdrop-blur border border-border-light text-text-1 hover:border-accent hover:text-accent btn-press text-base"
            >
              ✦ AI Match
            </Link>
          </div>

          {/* Quick stat strip */}
          <div className="mt-5 md:mt-12 flex items-center gap-4 md:gap-10 text-mono text-[10px] md:text-xs uppercase tracking-widest text-text-3 animate-fade-in">
            <span>500k+ titles</span>
            <span className="w-px h-4 bg-border" />
            <span>AI powered</span>
            <span className="w-px h-4 bg-border" />
            <span>spoiler-free</span>
          </div>

          {/* Sign in / Sign up — mobile-only, logged-out users */}
          {loggedOut && (
            <div className="md:hidden mt-4 w-full max-w-xs animate-fade-in">
              <div className="rounded-2xl bg-surface/80 backdrop-blur border border-border p-3 text-center">
                <p className="text-[11px] text-text-3 mb-2 leading-relaxed">
                  Save watchlist, track ratings, comment
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => signIn("google", { callbackUrl: "/" })}
                    className="flex-1 px-3 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover btn-press"
                  >
                    Sign in
                  </button>
                  <Link
                    href="/login"
                    className="flex-1 px-3 py-2 rounded-full bg-elevated border border-border-light text-text-1 text-sm font-medium hover:border-accent hover:text-accent btn-press"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Creator credit strip */}
          <Link
            href="/about"
            className="mt-3 md:mt-10 group inline-flex items-center gap-3 px-2 py-1.5 pr-4 rounded-full bg-surface/60 backdrop-blur border border-border hover:border-accent transition-all btn-press animate-fade-in"
          >
            <span
              className="relative grid place-items-center w-7 h-7 rounded-full overflow-hidden border border-accent/30 shrink-0"
              style={{ boxShadow: "0 0 12px -2px var(--accent-glow)" }}
              aria-hidden
            >
              <Image
                src="/ayush.jpg"
                alt=""
                fill
                sizes="28px"
                className="object-cover"
              />
            </span>
            <span className="text-sm text-text-2 group-hover:text-text-1 transition-colors">
              About the <span className="text-accent font-medium">creator</span>
            </span>
            <span className="hidden sm:inline text-text-3 text-xs font-mono uppercase tracking-widest border-l border-border pl-3 group-hover:text-accent transition-colors">
              →
            </span>
          </Link>

          {/* Scroll affordance — animated chevron pointing to content below.
              Mobile only since desktop hero is shorter. */}
          <div className="md:hidden mt-auto pt-3 flex flex-col items-center gap-1 text-text-3 animate-fade-in">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em]">
              Scroll for trending
            </p>
            <div className="grid place-items-center animate-bounce-soft">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <main className="bg-bg pb-24 relative">
        <div className="container-x">
          {/* ──── Region picker — works for everyone, no login needed ─────── */}
          <div className="mt-12 md:mt-16 mb-3 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] md:text-xs uppercase tracking-widest2 text-text-3">
              showing
            </span>
            <RegionInlinePicker current={region} />
          </div>

          {/* ──── Popular in {region} — TOP PRIORITY ────────── */}
          {regionMovies && regionMovies.length > 0 && (
            <HorizontalScrollRow
              title={`Popular in ${regionInfo.name}`}
              subtitle={`What's trending right now in ${regionInfo.flag} ${regionInfo.name}`}
              items={regionMovies}
              forceType="movie"
            />
          )}

          {/* ──── Top Series ─────────────────────── */}
          {regionTV && regionTV.length > 0 && (
            <HorizontalScrollRow
              title="Trending Series"
              subtitle="Most-watched series this week"
              items={regionTV}
              forceType="tv"
            />
          )}

          {/* ──── Trending row ─────────────────────────────── */}
          <HorizontalScrollRow
            title="Trending Globally"
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

          {/* ──── Now Playing in Theaters ─────────────────── */}
          {nowPlaying && nowPlaying.length > 0 && (
            <HorizontalScrollRow
              title="In Theaters Now"
              subtitle="Currently playing on the big screen"
              href="/discover?type=movie"
              items={nowPlaying}
              forceType="movie"
            />
          )}

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

          {/* ──── Critically Acclaimed ─────────────────────── */}
          {criticallyAcclaimed && criticallyAcclaimed.length > 0 && (
            <HorizontalScrollRow
              title="Critically Acclaimed"
              subtitle="Highest-rated films, vetted by audiences"
              label="essential watching"
              href="/discover?type=movie&sortBy=vote_average.desc&minRating=7.5"
              items={criticallyAcclaimed}
              forceType="movie"
            />
          )}

          {/* ──── Hidden Gems ──────────────────────────────── */}
          {hiddenGems && hiddenGems.length > 0 && (
            <HorizontalScrollRow
              title="Hidden Gems"
              subtitle="Brilliant films you probably haven't seen"
              label="underrated picks"
              href="/discover?type=movie&minRating=7"
              items={hiddenGems}
              forceType="movie"
            />
          )}

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
export async function getServerSideProps({ req, res }) {
  const region = getRegionFromReq(req);

  let trending = [];
  let popularMovies = [];
  let popularTV = [];
  let posterWall = [];
  let mostInterested = [];
  let nowPlaying = [];
  let criticallyAcclaimed = [];
  let hiddenGems = [];
  let regionMovies = [];   // region-origin films
  let regionTV = [];       // region-origin series

  try {
    const [t, pm, pt, np, acclaimed, gems, regMov, regTv] = await Promise.all([
      getTrending("week"),
      getPopularMovies(1, region),
      getPopularTV(1),
      getNowPlayingMovies(1, region).catch(() => ({ results: [] })),
      discoverMovies({
        sortBy: "vote_average.desc",
        minRating: 7.5,
        page: 1,
      }).catch(() => ({ results: [] })),
      discoverMovies({
        sortBy: "vote_average.desc",
        minRating: 7.0,
        page: 2,
      }).catch(() => ({ results: [] })),
      // What's currently popular in this region — ALL origins, sorted by
      // popularity, filtered by release window for the region. This gives
      // Hollywood blockbusters showing in IN, Korean hits, Indian originals
      // — basically what's trending right now in that country.
      discoverMovies({
        sortBy: "popularity.desc",
        region,
        page: 1,
      }).catch(() => ({ results: [] })),
      // Popular series — TV doesn't have a region filter, so we use global
      // popular series. They're mostly the same titles trending worldwide.
      discoverTV({
        sortBy: "popularity.desc",
        page: 1,
      }).catch(() => ({ results: [] })),
    ]);

    trending = (t.results || [])
      .filter((m) => m.media_type === "movie" || m.media_type === "tv")
      .slice(0, 18);
    popularMovies = (pm.results || []).slice(0, 18);
    popularTV = (pt.results || []).slice(0, 18);
    nowPlaying = (np.results || []).slice(0, 14);

    criticallyAcclaimed = (acclaimed.results || [])
      .filter((m) => (m.vote_count || 0) >= 200)
      .slice(0, 14);

    hiddenGems = (gems.results || [])
      .filter(
        (m) =>
          (m.vote_count || 0) >= 100 &&
          (m.popularity || 0) < 50 &&
          (m.vote_average || 0) >= 7.0
      )
      .slice(0, 14);
    if (hiddenGems.length < 6) {
      hiddenGems = (gems.results || []).slice(0, 14);
    }

    // Region-specific rows — add media_type so cards link correctly
    regionMovies = (regMov.results || [])
      .map((m) => ({ ...m, media_type: "movie" }))
      .slice(0, 18);
    regionTV = (regTv.results || [])
      .map((m) => ({ ...m, media_type: "tv" }))
      .slice(0, 18);

    // Build poster wall — prioritize region content for visual relevance
    const wallPool = [
      ...regionMovies,
      ...regionTV,
      ...trending,
      ...popularMovies,
      ...popularTV,
      ...nowPlaying,
      ...criticallyAcclaimed,
    ].filter((x) => x.poster_path);
    const seen = new Set();
    posterWall = [];
    for (const item of wallPool) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      posterWall.push(posterUrl(item.poster_path, "w342"));
      if (posterWall.length >= 30) break;
    }

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
      region,
      regionMovies,
      regionTV,
      trending,
      popularMovies,
      popularTV,
      posterWall,
      mostInterested,
      nowPlaying,
      criticallyAcclaimed,
      hiddenGems,
    },
  };
}

/**
 * Region picker pill rendered on the home page.
 * Clicking opens a popover with all 15 regions. Selecting one writes the
 * cookie and reloads the page so getServerSideProps sees the new region.
 */
function RegionInlinePicker({ current }) {
  const [open, setOpen] = useState(false);
  const info = getRegionInfo(current);

  const select = (code) => {
    if (code === current) {
      setOpen(false);
      return;
    }
    setRegionClient(code);
    // Hard reload so SSR re-runs with the new cookie
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm transition group ${
          open
            ? "bg-elevated border-accent text-text-1"
            : "bg-surface border-border hover:border-accent text-text-1"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-base">{info.flag}</span>
        <span>{info.name}</span>
        <span
          className={`text-text-3 text-xs transition ${
            open ? "rotate-180 text-accent" : ""
          }`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {open && (
        <>
          {/* Click-outside backdrop */}
          <button
            aria-label="Close"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="listbox"
            className="absolute z-50 left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-elevated border border-border rounded-2xl shadow-2xl py-2"
            style={{
              boxShadow: "0 16px 48px -8px rgba(0,0,0,0.6), 0 0 32px -8px var(--accent-glow)",
            }}
          >
            <p className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest2 text-text-3 border-b border-border mb-1">
              choose region
            </p>
            {REGIONS.map((r) => {
              const active = r.code === current;
              return (
                <button
                  key={r.code}
                  role="option"
                  aria-selected={active}
                  onClick={() => select(r.code)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm transition ${
                    active
                      ? "bg-accent-dim text-accent font-medium"
                      : "text-text-1 hover:bg-surface"
                  }`}
                >
                  <span className="text-lg">{r.flag}</span>
                  <span className="flex-1">{r.name}</span>
                  {active && (
                    <span className="text-accent text-xs" aria-hidden>
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
