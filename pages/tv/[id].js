// CineTales — /tv/[id]. Moctale-style detail page for series.

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
import CommentSection from "../../components/CommentSection";
import MovieCard from "../../components/MovieCard";
import {
  getTVDetail,
  posterUrl,
  backdropUrl,
  pickTrailer,
  pickProviders,
} from "../../lib/tmdb";

export default function TVDetailPage({ tv, trailer, providers, similar = [], cast = [], crew = [], productionCompanies = [], keywords = [] }) {
  const [trailerOpen, setTrailerOpen] = useState(false);
  if (!tv) return null;

  const startYear = (tv.first_air_date || "").slice(0, 4);
  const endYear = (tv.last_air_date || "").slice(0, 4);
  const yearStr = startYear
    ? endYear && endYear !== startYear
      ? `${startYear}–${endYear}`
      : startYear
    : null;
  const seasons = tv.number_of_seasons
    ? `${tv.number_of_seasons} ${tv.number_of_seasons === 1 ? "Season" : "Seasons"}`
    : null;
  const country = tv.origin_country?.[0] || null;
  const language = tv.spoken_languages?.[0]?.english_name || null;
  const creator = (tv.created_by || [])[0];
  const director = crew.find((c) => c.job === "Director");
  const writers = crew.filter((c) => c.job === "Writer" || c.job === "Screenplay");

  return (
    <>
      <Head>
        <title>{tv.name} — CineTales</title>
        <meta
          name="description"
          content={tv.overview?.slice(0, 160) || `${tv.name} on CineTales`}
        />
      </Head>
      <Navbar />

      <main className="bg-bg pb-24">
        {/* HERO */}
        <section className="relative">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.4/1] max-h-[70vh] overflow-hidden">
            {tv.backdrop_path ? (
              <Image
                src={backdropUrl(tv.backdrop_path, "original")}
                alt={tv.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-elevated" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-bg/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-bg/80 via-transparent to-bg/50" />

            {/* Play trailer button — center, only when trailer exists */}
            {trailer && (
              <button
                onClick={() => setTrailerOpen(true)}
                aria-label={`Play ${tv.name} trailer`}
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

          <div className="container-x">
            <div className="relative -mt-32 md:-mt-40 grid grid-cols-[120px_1fr] md:grid-cols-[180px_1fr] gap-5 md:gap-8">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border-light shadow-2xl bg-elevated">
                {tv.poster_path && (
                  <Image
                    src={posterUrl(tv.poster_path, "w500")}
                    alt={tv.name}
                    fill
                    sizes="180px"
                    priority
                    className="object-cover"
                  />
                )}
              </div>

              <div className="min-w-0 pt-4 md:pt-16">
                <p className="font-mono text-[11px] md:text-xs uppercase tracking-widest text-text-3">
                  Series
                  {yearStr && (
                    <>
                      <span className="mx-2">·</span>
                      {yearStr}
                    </>
                  )}
                  {seasons && (
                    <>
                      <span className="mx-2">·</span>
                      {seasons}
                    </>
                  )}
                </p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl text-text-1 leading-[1.05] mt-1">
                  {tv.name}
                </h1>
                {tv.tagline && (
                  <p className="mt-2 text-sm md:text-base text-text-2 italic max-w-xl">
                    {tv.tagline}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
                {(creator || director) && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      {creator ? "Created By" : "Directed By"}
                    </p>
                    <p className="text-text-1">
                      {creator?.name || director?.name}
                    </p>
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
                {tv.number_of_episodes && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-0.5">
                      Episodes
                    </p>
                    <p className="text-text-1">{tv.number_of_episodes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <TrailerButton
                  trailer={trailer}
                  title={tv.name}
                  year={startYear}
                />
                <WatchedButton
                  mediaId={tv.id}
                  mediaType="tv"
                  title={tv.name}
                  posterPath={tv.poster_path}
                />
                <WatchlistButton
                  mediaId={tv.id}
                  mediaType="tv"
                  title={tv.name}
                  posterPath={tv.poster_path}
                />
              </div>
            </div>
          </div>
        </section>

        {/* OVERVIEW + VIBE CHART */}
        <section className="container-x mt-12 md:mt-16 grid lg:grid-cols-[1fr_320px] gap-8 lg:gap-10">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
              // overview
            </p>
            <h2 className="font-display text-2xl md:text-4xl mb-4">The Story</h2>

            {/* Original name (if different) */}
            {tv.original_name && tv.original_name !== tv.name && (
              <p className="mb-4 text-sm text-text-3 font-mono">
                Original title:{" "}
                <span className="text-text-2">{tv.original_name}</span>
              </p>
            )}

            <p className="text-base md:text-lg leading-relaxed text-text-1/90 max-w-3xl">
              {tv.overview || "No overview available for this title yet."}
            </p>

            {(tv.genres || []).length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {tv.genres.map((g) => (
                  <GenreTag key={g.id} name={g.name} />
                ))}
              </div>
            )}

            {/* Crew details */}
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
                {tv.status && tv.status !== "Released" && tv.status !== "Ended" && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-text-3 mb-1">
                      Status
                    </p>
                    <p className="text-accent leading-snug">{tv.status}</p>
                  </div>
                )}
              </div>
            )}

            {/* Themes (TMDB keywords) */}
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

            {/* Production House */}
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
                        <Image
                          src={`https://image.tmdb.org/t/p/w200${p.logo_path}`}
                          alt={p.name}
                          width={70}
                          height={28}
                          className="object-contain h-6 md:h-7 w-auto opacity-80 hover:opacity-100 transition"
                          style={{ filter: "brightness(1.6) contrast(1.1)" }}
                        />
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
            <VibeChart genres={tv.genres || []} />
          </aside>
        </section>

        {/* AUDIENCE + RATING */}
        <section className="container-x mt-14 grid md:grid-cols-2 gap-5">
          <AudienceScore score={tv.vote_average} voteCount={tv.vote_count} />
          <RatingControls mediaId={tv.id} mediaType="tv" />
        </section>

        {/* PROVIDERS + AI PITCH */}
        <section className="container-x mt-5 grid md:grid-cols-2 gap-5">
          <WatchProviders providers={providers} />
          <AIPitch
            title={tv.name || tv.original_name}
            year={startYear}
            overview={tv.overview}
            genres={(tv.genres || []).map((g) => g.name)}
            type="tv"
          />
        </section>

        {/* CAST */}
        <div className="container-x">
          <CastCrewRow title="Cast" items={cast} roleKey="character" />
        </div>

        {/* CREW */}
        <div className="container-x">
          <CastCrewRow title="Crew" items={crew} roleKey="job" />
        </div>

        {/* COMMENTS */}
        <CommentSection
          mediaId={tv.id}
          mediaType="tv"
          title={tv.name}
          year={startYear}
          genres={(tv.genres || []).map((g) => g.name)}
        />

        {/* SIMILAR */}
        {similar?.length > 0 && (
          <section className="container-x mt-16">
            <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-3">
              // more like this
            </p>
            <h2 className="font-display text-2xl md:text-4xl mb-7">You Might Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} item={{ ...m, media_type: "tv" }} />
              ))}
            </div>
          </section>
        )}
      </main>

      {trailerOpen && trailer && (
        <TrailerModal
          youtubeKey={trailer.key}
          title={tv.name}
          onClose={() => setTrailerOpen(false)}
        />
      )}

      <Footer />
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  const id = parseInt(params.id, 10);
  if (!id || Number.isNaN(id)) return { notFound: true };

  try {
    const tv = await getTVDetail(id);
    if (!tv || !tv.id) return { notFound: true };

    const trailer = pickTrailer(tv.videos?.results);
    const providers = pickProviders(tv["watch/providers"]);
    const similar = (tv.similar?.results || []).slice(0, 12);
    const cast = (tv.credits?.cast || []).slice(0, 18).map((c) => ({
      id: c.id,
      credit_id: c.credit_id,
      name: c.name,
      character: c.character,
      profile_path: c.profile_path || null,
      order: c.order,
    }));
    const KEY_JOBS = new Set([
      "Director", "Writer", "Screenplay", "Story",
      "Executive Producer", "Producer", "Creator",
      "Director of Photography", "Original Music Composer", "Editor",
    ]);
    const crewRaw = (tv.credits?.crew || []).filter((c) => KEY_JOBS.has(c.job));
    const seen = new Map();
    for (const c of crewRaw) {
      if (!seen.has(c.id)) seen.set(c.id, { ...c, jobs: [c.job] });
      else seen.get(c.id).jobs.push(c.job);
    }
    const crew = [...seen.values()].slice(0, 14).map((c) => ({
      id: c.id,
      credit_id: c.credit_id,
      name: c.name,
      job: c.jobs.join(", "),
      profile_path: c.profile_path || null,
    }));

    const productionCompanies = (tv.production_companies || [])
      .filter((p) => p.name)
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        name: p.name,
        logo_path: p.logo_path || null,
        origin_country: p.origin_country || null,
      }));

    const keywords = (tv.keywords?.results || tv.keywords?.keywords || [])
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
        tv: {
          id: tv.id,
          name: tv.name,
          original_name: tv.original_name,
          overview: tv.overview,
          tagline: tv.tagline,
          poster_path: tv.poster_path,
          backdrop_path: tv.backdrop_path,
          first_air_date: tv.first_air_date,
          last_air_date: tv.last_air_date,
          number_of_seasons: tv.number_of_seasons,
          number_of_episodes: tv.number_of_episodes,
          vote_average: tv.vote_average,
          vote_count: tv.vote_count,
          genres: tv.genres || [],
          status: tv.status || null,
          original_language: tv.original_language || null,
          origin_country: tv.origin_country || [],
          spoken_languages: tv.spoken_languages || [],
          created_by: tv.created_by || [],
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
    console.error("tv SSR:", err);
    return { notFound: true };
  }
}
