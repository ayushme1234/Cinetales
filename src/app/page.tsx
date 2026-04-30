import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MediaCard } from "@/components/media-card";
import { Marquee } from "@/components/marquee";
import { tmdbApi } from "@/lib/tmdb";
import { ArrowRight, Search, Sparkles, Bookmark, Star } from "lucide-react";

export const revalidate = 3600;

export default async function HomePage() {
  let trending: Awaited<ReturnType<typeof tmdbApi.trending>>["results"] = [];
  let popularMovies: Awaited<ReturnType<typeof tmdbApi.popularMovies>>["results"] = [];
  let popularTv: Awaited<ReturnType<typeof tmdbApi.popularTv>>["results"] = [];

  try {
    const [a, b, c] = await Promise.all([
      tmdbApi.trending("week"),
      tmdbApi.popularMovies(),
      tmdbApi.popularTv(),
    ]);
    trending = a.results.slice(0, 12);
    popularMovies = b.results.slice(0, 8);
    popularTv = c.results.slice(0, 8);
  } catch (e) {
    console.error("TMDB fetch failed (set TMDB_BEARER_TOKEN):", e);
  }

  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b-[2.5px] border-ink">
        <div className="dots absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-5 pb-24 pt-16 md:pt-28">
          <div className="grid gap-14 md:grid-cols-12">
            <div className="md:col-span-8">
              <span className="fade-up inline-flex items-center gap-2 rounded-full brut-soft bg-acid px-3 py-1 text-xs font-bold uppercase tracking-widest">
                <Sparkles size={12} /> Movies · Shows · Anime
              </span>

              <h1 className="display-xl mt-6 text-[14vw] leading-[0.85] md:text-[8.5rem]">
                <span className="fade-up-1 block">Find tales</span>
                <span className="fade-up-2 block">
                  <span className="serif-italic font-normal italic text-electric">that </span>
                  <span className="bg-electric px-3 text-cream">matter.</span>
                </span>
              </h1>

              <p className="fade-up-3 mt-7 max-w-xl text-lg leading-relaxed text-ink/80">
                Search any movie or show. <span className="serif-italic">See where it streams.</span>{" "}
                Track what you've watched. Rate it with one tap —{" "}
                <span className="font-bold">Go for it</span>,{" "}
                <span className="font-bold">Timepass</span>, or{" "}
                <span className="font-bold">Skip it</span>.
              </p>

              <div className="fade-up-4 mt-9 flex flex-wrap gap-3">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 rounded-xl brut brut-cobalt px-5 py-3 text-sm font-bold uppercase tracking-wider"
                >
                  <Search size={18} /> Start searching
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl brut brut-cream px-5 py-3 text-sm font-bold uppercase tracking-wider"
                >
                  Sign in <ArrowRight size={18} />
                </Link>
              </div>

              {/* Trust line */}
              <p className="fade-up-4 mt-8 font-mono text-xs uppercase tracking-widest text-ink/50">
                ★ Powered by TMDB · 1M+ titles · Free forever
              </p>
            </div>

            <div className="md:col-span-4">
              <div className="relative h-full">
                <div className="fade-up-2 absolute -right-2 top-2 grid h-32 w-32 place-items-center rounded-full bg-acid brut spin-slow sticker">
                  <div className="text-center font-mono text-[10px] uppercase leading-tight">
                    Cinema<br />Pop Culture<br />Anime · Series<br />All in one
                  </div>
                </div>
                <div className="fade-up-3 mt-32 ml-4 rounded-2xl bg-tangerine p-6 brut tilt-l">
                  <div className="font-mono text-xs uppercase opacity-70">User says</div>
                  <p className="mt-2 text-3xl leading-tight">
                    <span className="serif-italic">"finally,</span>{" "}
                    <span className="display-xl">one search box for everything."</span>
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="h-7 w-7 rounded-full bg-electric brut-soft" />
                    <span className="font-bold">@filmbro · 4d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t-[2.5px] border-ink bg-acid py-3 text-ink">
          <Marquee
            items={[
              "★ Track films",
              "★ Watch trailers",
              "★ Rate shows",
              "★ Build watchlist",
              "★ Discover anime",
              "★ One search",
              "★ Cast your vote",
            ]}
          />
        </div>
      </section>

      {/* TRENDING */}
      <Section title="Trending this week" tag="hot right now" tagColor="brut-pink" href="/trending">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {trending.length === 0
            ? <EmptyState />
            : trending.slice(0, 6).map((m, i) => <MediaCard key={`${m.id}-${i}`} item={m} priority={i < 4} />)}
        </div>
      </Section>

      {/* THREE-VERDICT EXPLAINER */}
      <section className="bg-ink py-24 text-cream">
        <div className="mx-auto max-w-7xl px-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-acid">// how it works</p>
          <h2 className="display-xl mt-3 text-5xl md:text-7xl">
            Three buttons. <br />
            <span className="serif-italic font-normal italic text-acid">Zero overthinking.</span>
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { v: "GO FOR IT", c: "brut-acid", i: "01", d: "It slaps. Tell your friends. Block your weekend." },
              { v: "TIMEPASS", c: "brut-tangerine", i: "02", d: "Watchable when you're bored. Don't expect fireworks." },
              { v: "SKIP IT", c: "brut-pink", i: "03", d: "Save your two hours. Read the wikipedia plot instead." },
            ].map((x) => (
              <div key={x.v} className={`relative rounded-2xl ${x.c} brut p-8`}>
                <div className="font-mono text-sm font-bold opacity-60">{x.i}</div>
                <div className="display-xl mt-2 text-4xl">{x.v}</div>
                <p className="mt-4 text-base font-medium">{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl bg-cream p-6 text-ink brut">
            <div className="flex flex-wrap items-center gap-4">
              <Star className="fill-acid" size={36} />
              <div className="flex-1">
                <div className="display-xl text-2xl">Plus a 0–10 rating, if you're feeling specific.</div>
                <p className="text-sm text-ink/60">Half stars supported. Vibes encouraged.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR MOVIES */}
      <Section title="Popular films" tag="watched a lot" tagColor="brut-cobalt" href="/discover">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {popularMovies.length === 0 ? <EmptyState /> : popularMovies.map((m) => (
            <MediaCard key={m.id} item={{ ...m, media_type: "movie" }} />
          ))}
        </div>
      </Section>

      {/* POPULAR TV */}
      <Section title="Popular series" tag="binge zone" tagColor="brut-tangerine" href="/discover?type=tv">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
          {popularTv.length === 0 ? <EmptyState /> : popularTv.map((m) => (
            <MediaCard key={m.id} item={{ ...m, media_type: "tv" }} />
          ))}
        </div>
      </Section>

      {/* AI VIBES PROMO */}
      <section className="mx-auto max-w-7xl px-5 py-20">
        <div className="rounded-3xl bg-cobalt p-8 text-cream brut md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-acid px-3 py-1 text-xs font-bold uppercase tracking-widest text-ink brut-soft">
                <Sparkles size={12} /> New · powered by Llama
              </span>
              <h2 className="display-xl mt-5 text-4xl md:text-6xl">
                Describe a vibe.<br />
                <span className="serif-italic font-normal italic text-acid">
                  We'll find the films.
                </span>
              </h2>
              <p className="mt-5 text-lg text-cream/80">
                Type how you wanna feel — "rainy day comfort watch" or "movies that ruined me" — and
                our AI scans 1M+ titles to nail it.
              </p>
              <Link
                href="/vibes"
                className="mt-7 inline-flex items-center gap-2 rounded-xl brut bg-acid px-5 py-3 text-sm font-bold uppercase tracking-wider text-ink"
              >
                Try AI Vibes <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <div className="rounded-2xl bg-cream p-5 text-ink brut tilt-r">
                <div className="font-mono text-xs uppercase tracking-widest text-ink/50">
                  // example prompt
                </div>
                <p className="serif-italic mt-2 text-2xl">
                  "something to watch after a really bad day"
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="aspect-[2/3] rounded-lg bg-electric/30 brut-soft" />
                  <div className="aspect-[2/3] rounded-lg bg-tangerine/40 brut-soft" />
                  <div className="aspect-[2/3] rounded-lg bg-acid/50 brut-soft" />
                </div>
                <div className="mt-3 text-xs font-bold uppercase tracking-widest text-ink/60">
                  → 8 perfectly-matched picks
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-y-[2.5px] border-ink bg-electric py-24 text-cream">
        <div className="mx-auto max-w-4xl px-5 text-center">
          <Bookmark size={56} className="mx-auto" />
          <h2 className="display-xl mt-5 text-5xl md:text-7xl">
            Build your <span className="serif-italic font-normal italic">watchlist.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg">
            Sign in with Google in one tap. No passwords. No spam. Just your tales.
          </p>
          <Link
            href="/login"
            className="mt-9 inline-flex items-center gap-2 rounded-xl brut brut-cream px-6 py-3 text-base font-bold uppercase tracking-wider"
          >
            Sign in with Google <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}

function Section({
  title,
  tag,
  tagColor,
  href,
  children,
}: {
  title: string;
  tag: string;
  tagColor: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-20">
      <div className="mb-9 flex items-end justify-between">
        <div>
          <span className={`inline-block rounded-full ${tagColor} brut-soft px-3 py-1 text-xs font-bold uppercase tracking-widest`}>
            {tag}
          </span>
          <h2 className="display-xl mt-3 text-4xl md:text-6xl">{title}</h2>
        </div>
        <Link href={href} className="hidden items-center gap-2 font-bold transition hover:gap-3 hover:text-electric md:flex">
          See all <ArrowRight size={18} />
        </Link>
      </div>
      {children}
    </section>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full rounded-2xl bg-cream p-10 text-center brut">
      <p className="display-xl text-3xl">No data yet.</p>
      <p className="mt-2 text-ink/70">
        Add your <code className="rounded bg-acid px-1.5 py-0.5 font-mono text-sm">TMDB_BEARER_TOKEN</code> to <code className="rounded bg-acid px-1.5 py-0.5 font-mono text-sm">.env</code> and restart the dev server.
      </p>
    </div>
  );
}
