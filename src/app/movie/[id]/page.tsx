import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MediaCard } from "@/components/media-card";
import { MediaActions } from "@/components/media-actions";
import { VerdictStats } from "@/components/verdict-stats";
import { Comments } from "@/components/comments";
import { TrailerHero } from "@/components/trailer-hero";
import { AIRecommendations } from "@/components/ai-recommendations";
import { AIChat } from "@/components/ai-chat";
import { tmdbApi, IMG, pickTrailer } from "@/lib/tmdb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Star, Clock, Calendar } from "lucide-react";

export const revalidate = 86400;

export default async function MoviePage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) notFound();

  let movie;
  try {
    movie = await tmdbApi.details("movie", id);
  } catch {
    notFound();
  }

  const session = await getServerSession(authOptions);
  const userId = session?.user ? (session.user as any).id : null;

  const [myReview, allComments, verdictCounts, ratingAgg, watchlistRow] = await Promise.all([
    userId
      ? prisma.review.findUnique({
          where: { userId_tmdbId_mediaType: { userId, tmdbId: id, mediaType: "movie" } },
        })
      : Promise.resolve(null),
    prisma.review.findMany({
      where: { tmdbId: id, mediaType: "movie", text: { not: null } },
      orderBy: [{ likes: "desc" }, { createdAt: "desc" }],
      take: 50,
      include: { user: { select: { id: true, name: true, image: true } } },
    }),
    prisma.review.groupBy({
      by: ["verdict"],
      where: { tmdbId: id, mediaType: "movie" },
      _count: { verdict: true },
    }),
    prisma.review.aggregate({
      where: { tmdbId: id, mediaType: "movie", rating: { not: null } },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    userId
      ? prisma.watchlist.findUnique({
          where: { userId_tmdbId_mediaType: { userId, tmdbId: id, mediaType: "movie" } },
        })
      : Promise.resolve(null),
  ]);

  const verdictTally = { goFor: 0, timepass: 0, skip: 0 };
  for (const v of verdictCounts) {
    if (v.verdict === "go-for-it") verdictTally.goFor = v._count.verdict;
    if (v.verdict === "timepass") verdictTally.timepass = v._count.verdict;
    if (v.verdict === "skip-it") verdictTally.skip = v._count.verdict;
  }

  const backdrop = IMG.backdrop(movie.backdrop_path);
  const poster = IMG.poster(movie.poster_path);
  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const cast = movie.credits?.cast.slice(0, 6) || [];
  const providers = movie["watch/providers"]?.results?.IN || movie["watch/providers"]?.results?.US;
  const similar = (movie as any).similar?.results?.slice(0, 6) || [];
  const trailer = pickTrailer(movie.videos);

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative border-b-[2.5px] border-ink">
        {backdrop && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center opacity-30"
              style={{ backgroundImage: `url(${backdrop})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cream via-cream/85 to-cream/40" />
          </>
        )}
        <div className="relative mx-auto max-w-7xl px-5 py-12 md:py-16">
          <div className="grid gap-10 md:grid-cols-12">
            {/* LEFT — poster + actions + stats */}
            <div className="md:col-span-4">
              <div className="fade-up relative aspect-[2/3] overflow-hidden rounded-3xl brut">
                {poster ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={poster} alt={movie.title || ""} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center bg-cobalt p-4 text-center text-cream">
                    {movie.title}
                  </div>
                )}
              </div>
              <MediaActions
                tmdbId={movie.id}
                mediaType="movie"
                title={movie.title || ""}
                poster={movie.poster_path || null}
                initialInWatchlist={!!watchlistRow}
                initialVerdict={myReview?.verdict ?? null}
                initialRating={myReview?.rating ?? null}
              />
              <div className="mt-5">
                <VerdictStats
                  goFor={verdictTally.goFor}
                  timepass={verdictTally.timepass}
                  skip={verdictTally.skip}
                  avgRating={ratingAgg._avg.rating ?? null}
                  ratingCount={ratingAgg._count.rating}
                />
              </div>
            </div>

            {/* RIGHT — meta + trailer */}
            <div className="md:col-span-8">
              <div className="fade-up-1">
                <span className="inline-block rounded-full brut-soft brut-cobalt px-3 py-1 text-xs font-bold uppercase tracking-widest">
                  Film
                </span>
                <h1 className="display-xl mt-4 text-4xl md:text-7xl">{movie.title}</h1>
                {movie.tagline && (
                  <p className="serif-italic mt-3 text-2xl text-ink/65">"{movie.tagline}"</p>
                )}
              </div>

              <div className="fade-up-2 mt-6 flex flex-wrap items-center gap-3 text-sm font-bold">
                {movie.vote_average ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-acid px-3 py-1 brut-soft">
                    <Star size={14} fill="currentColor" /> {movie.vote_average.toFixed(1)} TMDB
                  </span>
                ) : null}
                {movie.runtime ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 brut-soft">
                    <Clock size={14} /> {movie.runtime}m
                  </span>
                ) : null}
                {movie.release_date && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-cream px-3 py-1 brut-soft">
                    <Calendar size={14} /> {movie.release_date.slice(0, 4)}
                  </span>
                )}
              </div>

              {movie.genres && movie.genres.length > 0 && (
                <div className="fade-up-2 mt-5 flex flex-wrap gap-2">
                  {movie.genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/discover?type=movie&genre=${g.id}`}
                      className="rounded-full bg-tangerine px-3 py-1 text-xs font-bold uppercase brut-soft transition hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--ink)]"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              <p className="fade-up-3 mt-6 max-w-2xl text-lg leading-relaxed text-ink/85">
                {movie.overview}
              </p>

              {director && (
                <p className="fade-up-3 mt-4 font-medium">
                  <span className="text-ink/60">Directed by</span>{" "}
                  <span className="font-bold">{director.name}</span>
                </p>
              )}

              {/* TRAILER HERO */}
              {(backdrop || trailer) && (
                <div className="fade-up-4 mt-9">
                  <TrailerHero
                    backdropUrl={backdrop}
                    trailerKey={trailer?.key ?? null}
                    title={movie.title || ""}
                  />
                </div>
              )}

              {/* WATCH PROVIDERS */}
              {providers && (providers.flatrate || providers.rent || providers.buy) && (
                <div className="fade-up-4 mt-8 rounded-2xl bg-cream p-5 brut">
                  <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
                    Where to watch
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {[
                      ...(providers.flatrate || []),
                      ...(providers.rent || []),
                      ...(providers.buy || []),
                    ]
                      .slice(0, 8)
                      .map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={p.provider_id}
                          src={`/api/img?path=${encodeURIComponent(p.logo_path)}&size=w92`}
                          alt={p.provider_name}
                          title={p.provider_name}
                          className="h-12 w-12 rounded-lg border-2 border-ink transition hover:scale-110"
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CAST */}
      {cast.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="display-xl text-3xl md:text-5xl">Cast.</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {cast.map((c) => (
              <div key={c.id} className="rounded-2xl bg-cream p-3 brut transition hover:-translate-y-1">
                <div className="aspect-square overflow-hidden rounded-xl bg-ink/10">
                  {c.profile_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/img?path=${encodeURIComponent(c.profile_path)}&size=w185`}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-bold">
                      {c.name[0]}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm font-bold">{c.name}</div>
                <div className="text-xs text-ink/60">{c.character}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* COMMENTS */}
      <Comments
        tmdbId={movie.id}
        mediaType="movie"
        title={movie.title || ""}
        poster={movie.poster_path || null}
        initialComments={allComments.map((c) => ({
          id: c.id,
          text: c.text,
          verdict: c.verdict,
          rating: c.rating,
          likes: c.likes,
          createdAt: c.createdAt.toISOString(),
          user: c.user,
        }))}
        myVerdict={myReview?.verdict ?? null}
        myCommentText={myReview?.text ?? null}
        myCommentId={myReview?.id ?? null}
      />

      {/* AI RECOMMENDATIONS */}
      <AIRecommendations
        title={movie.title || ""}
        mediaType="movie"
        overview={movie.overview}
        genres={movie.genres?.map((g) => g.name)}
      />

      {/* SIMILAR */}
      {similar.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="display-xl text-3xl md:text-5xl">More like this.</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
            {similar.map((m: any) => (
              <MediaCard key={m.id} item={{ ...m, media_type: "movie" }} />
            ))}
          </div>
        </section>
      )}

      <AIChat
        title={movie.title || ""}
        mediaType="movie"
        year={movie.release_date?.slice(0, 4)}
        overview={movie.overview}
      />

      <Footer />
    </>
  );
}
