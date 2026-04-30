import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IMG } from "@/lib/tmdb";

const VERDICT_LABEL: Record<string, { label: string; c: string }> = {
  "go-for-it": { label: "Go for it", c: "brut-acid" },
  "timepass": { label: "Timepass", c: "brut-tangerine" },
  "skip-it": { label: "Skip it", c: "brut-pink" },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const [reviews, watchlistCount] = await Promise.all([
    prisma.review.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 24 }),
    prisma.watchlist.count({ where: { userId } }),
  ]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        {/* HEADER */}
        <div className="rounded-3xl bg-cream p-8 brut md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
            {session.user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={session.user.image}
                alt=""
                className="h-24 w-24 rounded-full border-[2.5px] border-ink"
              />
            ) : (
              <div className="grid h-24 w-24 place-items-center rounded-full bg-electric brut text-cream display-xl text-3xl">
                {session.user.name?.[0]}
              </div>
            )}
            <div>
              <span className="rounded-full bg-acid px-3 py-1 text-xs font-bold uppercase brut">Profile</span>
              <h1 className="display-xl mt-2 text-4xl md:text-6xl">{session.user.name}</h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold">
                <span className="rounded-full bg-cream px-3 py-1 brut">
                  {reviews.length} verdicts
                </span>
                <Link href="/watchlist" className="rounded-full bg-cobalt px-3 py-1 text-cream brut">
                  {watchlistCount} on watchlist
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        <section className="mt-12">
          <h2 className="display-xl text-3xl md:text-5xl">Your verdicts.</h2>
          {reviews.length === 0 ? (
            <p className="mt-6 text-ink/70">
              No verdicts yet. Open any film or show and tap one of the three buttons.
            </p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.map((r) => {
                const v = VERDICT_LABEL[r.verdict];
                const poster = IMG.poster(r.poster, "w342");
                return (
                  <Link
                    key={r.id}
                    href={`/${r.mediaType}/${r.tmdbId}`}
                    className="flex gap-4 rounded-2xl bg-cream p-4 brut transition hover:-translate-y-1"
                  >
                    <div className="relative h-32 w-20 shrink-0 overflow-hidden rounded-lg border-2 border-ink">
                      {poster ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={poster} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full place-items-center bg-ink/10 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
                        {r.mediaType === "tv" ? "Series" : "Film"}
                      </div>
                      <div className="font-bold">{r.title}</div>
                      <span
                        className={`mt-2 inline-block w-fit rounded-full ${v?.c || "brut-cream"} px-3 py-1 text-xs font-bold uppercase brut-soft`}
                      >
                        {v?.label || r.verdict}
                      </span>
                      {r.rating !== null && (
                        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-acid px-2 py-0.5 text-xs font-bold brut-soft">
                          ★ {r.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
