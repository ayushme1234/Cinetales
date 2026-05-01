// CineTales — /movie/[id]. Moctale-style detail page.
// Hero: backdrop + play button + poster card + meta + Watched/Watchlist CTAs.
// Side rail: VibeChart, Watch Online (providers), AI Pitch.
// Full Cast row + Crew row with circular avatars.
// Mobile-first layout (stacks elegantly on small screens).

import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import GenreTag from "../../components/GenreTag";
import RatingControls from "../../components/RatingControls";
import WatchlistButton from "../../components/WatchlistButton";
import WatchedButton from "../../components/WatchedButton";
import TrailerButton from "../../components/TrailerButton";
import TrailerModal from "../../components/TrailerModal";
import WatchProviders from "../../components/WatchProviders";
import AIPitch from "../../components/AIPitch";
import VibeChart from "../../components/VibeChart";
import AudienceScore from "../../components/AudienceScore";
import CastCrewRow from "../../components/CastCrewRow";
import MovieCard from "../../components/MovieCard";
import {
  getMovieDetail,
  posterUrl,
  backdropUrl,
  pickTrailer,
  pickProviders,
} from "../../lib/tmdb";

export default function MovieDetailPage({
  movie,
  trailer,
  providers,
  similar = [],
  cast = [],
  crew = [],
  productionCompanies = [],
  keywords = [],
}) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  if (!movie) return null;

  const year = (movie.release_date || "").slice(0, 4);
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;
  const country = movie.production_countries?.[0]?.name || null;
  const language = movie.spoken_languages?.[0]?.english_name || null;
  const certification = movie.adult ? "18+" : null; // TMDB doesn't expose this cleanly without /release_dates
  const director = crew.find((c) => c.job === "Director");
  const writers = crew.filter(
    (c) => c.job === "Writer" || c.job === "Screenplay"
  );

  return (
    <>
      <Head>
        <title>{movie.title} — CineTales</title>
        <meta
          name="description"
          content={movie.overview?.slice(0, 160) || `${movie.title} on CineTales`}
        />
      </Head>
      <Navbar />

      <main className="bg-bg pb-24">
        {/* ─── HERO ────────────────────────────────────────── */}
        <section className="relative">
          {/* Backdrop */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1] max-h-[70vh] overflow-hidden">
            {movie.backdrop_path ? (
              <Image
                src={backdropUrl(movie.backdrop_path, "original")}
                alt={movie.title}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-elevated" />
            )}
            {/* Vignettes for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-bg/50" />

            {/* Play trailer button — center, only when trailer exists */}
            {trailer && (
              <button
                onClick={() => setTrailerOpen(true)}
                aria-label={`Play ${movie.title} trailer`}
                className="absolute inset-0 grid place-items-center group"
              >
                <span
                  className="grid place-items-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent text-white shadow-2xl group-hover:scale-110 transition-transform animate-pulse-accent"
                  style={{ boxShadow: "0 0 60px -8px var(--accent-glow), 0 8px 32px -8px rgba(0,0,0,0.5)" }}
                >
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" className="ml-1.5" aria-hidden>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            )}
          </div>

          {/* Floating info card overlapping backdrop */}
          <div className="container-x">
            <div className="relative -mt-32 md:-mt-40 grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] gap-5 md:gap-8">
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border-light shadow-2xl bg-elevated">
                {movie.poster_path && (
                  <Image
                    src={posterUrl(movie.poster_path, "w500")}
                    alt={movie.title}
                    fill
                    sizes="180px"
                    priority
                    className="object-cover"
                  />
                )}
              </div>

              {/* Title + meta */}
              <div className="min-w-0 pt-4 md:pt-16">
                <p className="font-mono text-[11px] md:text-xs uppercase tracking-widest text-text-3">
                  Movie
                  {year && (
                    <>
                      <span className="mx-2">·</span>
                      {year}
                    </>
                  )}
                  {runtime && (
                    <>
                      <span className="mx-2">·</span>
                      {runtime}
                    </>
                  )}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-text-1 leading-[1.05] mt-1">
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="mt-2 text-sm md:text-base text-text-2 italic max-w-xl">
                    {movie.tagline}
                  </p>
                )}
              </div>
            </div>

            {/* Meta strip + actions */}
            <div className="mt-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                {director && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      Directed By
                    </p>
                    <p className="text-text-1">{director.name}</p>
                  </div>
                )}
                {country && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      Country
                    </p>
                    <p className="text-text-1">{country}</p>
                  </div>
                )}
                {language && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      Language
                    </p>
                    <p className="text-text-1">{language}</p>
                  </div>
                )}
                {certification && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      Age Rating
                    </p>
                    <p className="text-text-1">{certification}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <TrailerButton
                  trailer={trailer}
                  title={movie.title}
                  year={year}
                />
                <WatchedButton
                  mediaId={movie.id}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path}
                />
                <WatchlistButton
                  mediaId={movie.id}
                  mediaType="movie"
                  title={movie.title}
                  posterPath={movie.poster_path}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── OVERVIEW + VIBE CHART ─────────────────────── */}
        <section className="container-x mt-12 md:mt-16 grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
              // overview
            </p>
            <h2 className="font-display text-2xl md:text-4xl mb-4">The Story</h2>

            {/* Original title (only shown if it differs from displayed title) */}
            {movie.original_title && movie.original_title !== movie.title && (
              <p className="mb-4 text-sm text-text-3 font-mono">
                Original title:{" "}
                <span className="text-text-2">{movie.original_title}</span>
              </p>
            )}

            <p className="text-base md:text-lg leading-relaxed text-text-1/90 max-w-3xl">
              {movie.overview || "No overview available for this title yet."}
            </p>

            {/* Genres */}
            {(movie.genres || []).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <GenreTag key={g.id} name={g.name} />
                ))}
              </div>
            )}

            {/* ─── Crew details — Written By / Directors / DP / Music ── */}
            {(writers.length > 0 || crew.length > 0) && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 text-sm">
                {writers.length > 0 && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Written By
                    </p>
                    <p className="text-text-1 leading-snug">
                      {writers.slice(0, 3).map((w) => w.name).join(", ")}
                    </p>
                  </div>
                )}
                {crew.find((c) => c.job?.includes("Producer")) && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Producer
                    </p>
                    <p className="text-text-1 leading-snug">
                      {crew
                        .filter((c) => c.job?.includes("Producer"))
                        .slice(0, 2)
                        .map((c) => c.name)
                        .join(", ")}
                    </p>
                  </div>
                )}
                {crew.find((c) => c.job?.includes("Cinematography") || c.job?.includes("Photography")) && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Cinematography
                    </p>
                    <p className="text-text-1 leading-snug">
                      {crew.find((c) => c.job?.includes("Cinematography") || c.job?.includes("Photography"))?.name}
                    </p>
                  </div>
                )}
                {crew.find((c) => c.job?.includes("Music")) && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Music
                    </p>
                    <p className="text-text-1 leading-snug">
                      {crew.find((c) => c.job?.includes("Music"))?.name}
                    </p>
                  </div>
                )}
                {crew.find((c) => c.job?.includes("Editor")) && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Editor
                    </p>
                    <p className="text-text-1 leading-snug">
                      {crew.find((c) => c.job?.includes("Editor"))?.name}
                    </p>
                  </div>
                )}
                {movie.status && movie.status !== "Released" && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Status
                    </p>
                    <p className="text-accent leading-snug">{movie.status}</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── Themes (TMDB keywords) ──────────────────────── */}
            {keywords && keywords.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-3">
                  Themes
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 12).map((k) => (
                    <span
                      key={k.id}
                      className="text-xs px-3 py-1 rounded-full bg-elevated border border-border text-text-2"
                    >
                      {k.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ─── Production House ────────────────────────────── */}
            {productionCompanies && productionCompanies.length > 0 && (
              <div className="mt-8">
                <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-3">
                  Production House
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  {productionCompanies.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2.5"
                      title={p.name}
                    >
                      {p.logo_path ? (
                        <span className="relative h-6 md:h-7 w-auto">
                          <Image
                            src={`https://image.tmdb.org/t/p/w200${p.logo_path}`}
                            alt={p.name}
                            width={70}
                            height={28}
                            className="object-contain h-6 md:h-7 w-auto opacity-80 hover:opacity-100 transition"
                            style={{ filter: "brightness(1.6) contrast(1.1)" }}
                          />
                        </span>
                      ) : (
                        <span className="text-sm text-text-2 px-3 py-1 rounded bg-elevated border border-border">
                          {p.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <VibeChart genres={movie.genres || []} />
          </aside>
        </section>

        {/* ─── AUDIENCE SCORE + RATING + AI ──────────────── */}
        <section className="container-x mt-14 grid md:grid-cols-2 gap-5">
          <AudienceScore
            score={movie.vote_average}
            voteCount={movie.vote_count}
          />
          <RatingControls mediaId={movie.id} mediaType="movie" />
        </section>

        {/* ─── WATCH PROVIDERS + AI PITCH ────────────────── */}
        <section className="container-x mt-5 grid md:grid-cols-2 gap-5">
          <WatchProviders providers={providers} />
          <AIPitch
            title={movie.title || movie.original_title}
            year={year}
            overview={movie.overview}
            genres={(movie.genres || []).map((g) => g.name)}
            type="movie"
          />
        </section>

        {/* ─── CAST ──────────────────────────────────────── */}
        <div className="container-x">
          <CastCrewRow title="Cast" items={cast} roleKey="character" />
        </div>

        {/* ─── CREW ──────────────────────────────────────── */}
        <div className="container-x">
          <CastCrewRow title="Crew" items={crew} roleKey="job" />
        </div>

        {/* ─── SIMILAR ──────────────────────────────────── */}
        {similar?.length > 0 && (
          <section className="container-x mt-16">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
              // more like this
            </p>
            <h2 className="font-display text-2xl md:text-4xl mb-7">You Might Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} item={{ ...m, media_type: "movie" }} />
              ))}
            </div>
          </section>
        )}
      </main>

      {trailerOpen && trailer && (
        <TrailerModal
          youtubeKey={trailer.key}
          title={movie.title}
          onClose={() => setTrailerOpen(false)}
        />
      )}

      <Footer />
    </>
  );
}

/* ─── SSR ─────────────────────────────────────────────────────── */
export async function getServerSideProps({ params, res }) {
  const id = parseInt(params.id, 10);
  if (!id || Number.isNaN(id)) return { notFound: true };

  try {
    const movie = await getMovieDetail(id);
    if (!movie || !movie.id) return { notFound: true };

    const trailer = pickTrailer(movie.videos?.results);
    const providers = pickProviders(movie["watch/providers"]);
    const similar = (movie.similar?.results || []).slice(0, 12);
    const cast = (movie.credits?.cast || []).slice(0, 18).map((c) => ({
      id: c.id,
      credit_id: c.credit_id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path || null,
      order: c.order,
    }));
    const KEY_JOBS = new Set([
      "Director", "Writer", "Screenplay", "Story",
      "Producer", "Executive Producer", "Director of Photography",
      "Original Music Composer", "Editor",
    ]);
    const crewRaw = (movie.credits?.crew || []).filter((c) => KEY_JOBS.has(c.job));
    // Dedupe by person (sometimes same person has multiple jobs)
    const seen = new Map();
    for (const c of crewRaw) {
      if (!seen.has(c.id)) {
        seen.set(c.id, { ...c, jobs: [c.job] });
      } else {
        seen.get(c.id).jobs.push(c.job);
      }
    }
    const crew = [...seen.values()].slice(0, 14).map((c) => ({
      id: c.id,
      credit_id: c.credit_id,
      name: c.name,
      job: c.jobs.join(", "),
      profile_path: c.profile_path || null,
    }));

    // Production companies — keep only ones with logos for visual quality
    const productionCompanies = (movie.production_companies || [])
      .filter((p) => p.name)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        logo_path: p.logo_path || null,
        origin_country: p.origin_country || null,
      }));

    // Keywords — first 12 max for "Themes" pills
    const keywords = (movie.keywords?.keywords || [])
      .slice(0, 12)
      .map((k) => ({ id: k.id, name: k.name }));

    if (res) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=600, stale-while-revalidate=1200"
      );
    }

    return {
      props: {
        movie: {
          id: movie.id,
          title: movie.title,
          original_title: movie.original_title,
          overview: movie.overview,
          tagline: movie.tagline,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          runtime: movie.runtime,
          vote_average: movie.vote_average,
          vote_count: movie.vote_count,
          genres: movie.genres || [],
          adult: movie.adult,
          status: movie.status || null,
          original_language: movie.original_language || null,
          production_countries: movie.production_countries || [],
          spoken_languages: movie.spoken_languages || [],
          budget: movie.budget || 0,
          revenue: movie.revenue || 0,
        },
        trailer,
        providers,
        similar,
        cast,
        crew,
        productionCompanies,
        keywords,
      },
    };
  } catch (err) {
    console.error("movie SSR:", err);
    return { notFound: true };
  }
}
