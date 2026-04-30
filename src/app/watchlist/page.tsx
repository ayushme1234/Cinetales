import Link from "next/link";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IMG } from "@/lib/tmdb";
import { Bookmark } from "lucide-react";

export default async function WatchlistPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id;
  const items = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 py-12">
        <span className="inline-block rounded-full brut brut-cobalt px-3 py-1 text-xs font-bold uppercase tracking-widest">
          Saved for later
        </span>
        <h1 className="display-xl mt-3 text-5xl md:text-7xl">Your watchlist.</h1>

        {items.length === 0 ? (
          <div className="mt-12 rounded-3xl bg-cream p-12 text-center brut">
            <Bookmark size={48} className="mx-auto" />
            <h2 className="display-xl mt-4 text-3xl">Empty for now.</h2>
            <p className="mt-2 text-ink/70">Browse and tap the bookmark on any film or show.</p>
            <Link
              href="/discover"
              className="mt-6 inline-block rounded-xl brut brut-pink px-5 py-3 font-bold uppercase"
            >
              Find something to watch
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {items.map((it) => {
              const poster = IMG.poster(it.poster);
              return (
                <Link
                  key={it.id}
                  href={`/${it.mediaType}/${it.tmdbId}`}
                  className="group block"
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-2xl brut brut-cream">
                    {poster ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={poster} alt={it.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full place-items-center bg-cobalt p-4 text-center font-bold text-cream">
                        {it.title}
                      </div>
                    )}
                  </div>
                  <h3 className="mt-3 line-clamp-1 font-bold">{it.title}</h3>
                  <p className="text-sm text-ink/60 uppercase">
                    {it.mediaType === "tv" ? "Series" : "Film"}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
