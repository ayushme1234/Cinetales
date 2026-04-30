import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MediaCard } from "@/components/media-card";
import { FilterBar } from "@/components/filter-bar";
import { tmdbApi } from "@/lib/tmdb";

export const revalidate = 1800;

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams: { type?: string; genre?: string; year?: string; sort?: string; rating?: string };
}) {
  const type = (searchParams.type === "tv" ? "tv" : "movie") as "movie" | "tv";
  const genre = searchParams.genre ? Number(searchParams.genre) : undefined;
  const year = searchParams.year ? Number(searchParams.year) : undefined;
  const sort = searchParams.sort;
  const minRating = searchParams.rating ? Number(searchParams.rating) : undefined;

  let results: any[] = [];
  let movieGenres: any[] = [];
  let tvGenres: any[] = [];

  try {
    const [mg, tg] = await Promise.all([tmdbApi.movieGenres(), tmdbApi.tvGenres()]);
    movieGenres = mg.genres;
    tvGenres = tg.genres;

    const data =
      type === "tv"
        ? await tmdbApi.discoverTv({ genre, year, sort, minRating })
        : await tmdbApi.discoverMovies({ genre, year, sort, minRating });
    results = data.results.map((r) => ({ ...r, media_type: type }));
  } catch (e) {
    console.error(e);
  }

  const activeGenreName =
    genre && (type === "tv" ? tvGenres : movieGenres).find((g) => g.id === genre)?.name;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <span className="inline-block rounded-full brut brut-acid px-3 py-1 text-xs font-bold uppercase tracking-widest">
          Browse the catalog
        </span>
        <h1 className="display-xl mt-3 text-5xl md:text-7xl">Discover.</h1>
        <p className="mt-2 text-lg text-ink/70">
          Filter by genre, year, rating. Find the next thing to obsess over.
        </p>

        <div className="mt-8">
          <FilterBar movieGenres={movieGenres} tvGenres={tvGenres} />
        </div>

        {(activeGenreName || year || minRating) && (
          <div className="mt-6 flex flex-wrap gap-2">
            {activeGenreName && <Pill color="brut-pink">Genre: {activeGenreName}</Pill>}
            {year && <Pill color="brut-cobalt">Year: {year}</Pill>}
            {minRating && <Pill color="brut-acid">{minRating}+ ★</Pill>}
          </div>
        )}

        <div className="mt-8">
          {results.length === 0 ? (
            <div className="rounded-2xl bg-cream p-10 text-center brut">
              <p className="display-xl text-3xl">No matches.</p>
              <p className="mt-2 text-ink/70">Try loosening the filters.</p>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm font-bold uppercase tracking-widest text-ink/60">
                {results.length} results
              </p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {results.map((m) => (
                  <MediaCard key={`${m.media_type}-${m.id}`} item={m} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span className={`rounded-full ${color} px-3 py-1 text-xs font-bold uppercase brut`}>
      {children}
    </span>
  );
}
