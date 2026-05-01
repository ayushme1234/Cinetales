// CineTales — /watchlist page.
// Grid of saved titles with Remove + Watched toggle. Redirects to /login if unauthed.

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WatchlistPage() {
  const { status } = useSession();
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/watchlist");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/watchlist");
        const data = res.ok ? await res.json() : [];
        if (!cancelled) setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [status]);

  async function remove(item) {
    const prev = items;
    setItems((cur) => cur.filter((x) => !(x.media_id === item.media_id && x.media_type === item.media_type)));
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: item.media_id, mediaType: item.media_type }),
      });
      if (!res.ok) throw new Error("delete failed");
    } catch (e) {
      console.error(e);
      setItems(prev);
    }
  }

  async function toggleWatched(item) {
    const newWatched = !item.watched;
    setItems((cur) =>
      cur.map((x) =>
        x.media_id === item.media_id && x.media_type === item.media_type ? { ...x, watched: newWatched } : x
      )
    );
    try {
      const res = await fetch("/api/watchlist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: item.media_id,
          mediaType: item.media_type,
          watched: newWatched,
        }),
      });
      if (!res.ok) throw new Error("patch failed");
    } catch (e) {
      console.error(e);
      // rollback
      setItems((cur) =>
        cur.map((x) =>
          x.media_id === item.media_id && x.media_type === item.media_type ? { ...x, watched: !newWatched } : x
        )
      );
    }
  }

  if (status === "loading" || status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <div className="min-h-screen grid place-items-center bg-bg">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  const filtered =
    filter === "watched"
      ? items.filter((x) => x.watched)
      : filter === "unwatched"
      ? items.filter((x) => !x.watched)
      : items;

  return (
    <>
      <Head>
        <title>Your Watchlist — CineTales</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24">
        <div className="container-x">
          <header className="mb-10 max-w-3xl animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent/70 mb-3">// your queue</p>
            <h1 className="font-display text-5xl md:text-6xl text-text-1 leading-[0.95]">Watchlist</h1>
            <p className="mt-4 text-text-2 text-base md:text-lg">
              Everything you&rsquo;ve saved for later, in one place.
            </p>
          </header>

          {items.length > 0 && (
            <div className="mb-8 flex gap-2">
              {[
                { v: "all", l: `All (${items.length})` },
                { v: "unwatched", l: `Unwatched (${items.filter((x) => !x.watched).length})` },
                { v: "watched", l: `Watched (${items.filter((x) => x.watched).length})` },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setFilter(opt.v)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border btn-press transition ${
                    filter === opt.v
                      ? "bg-accent text-white border-accent"
                      : "bg-surface text-text-2 border-border hover:text-text-1 hover:border-border-light"
                  }`}
                >
                  {opt.l}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="py-20 grid place-items-center">
              <LoadingSpinner />
            </div>
          ) : items.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-display text-3xl text-text-1 mb-3">Nothing here yet.</p>
              <p className="text-text-2 mb-6">Start exploring and save what catches your eye.</p>
              <Link
                href="/discover"
                className="inline-block px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover btn-press"
              >
                Discover films →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map((item) => {
                const href = item.media_type === "tv" ? `/tv/${item.media_id}` : `/movie/${item.media_id}`;
                const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
                return (
                  <div
                    key={`${item.media_type}-${item.media_id}`}
                    className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-elevated border border-border hover:border-border-light transition"
                  >
                    <Link href={href} className="absolute inset-0">
                      {poster ? (
                        <Image src={poster} alt={item.title || ""} fill sizes="220px" className="object-cover group-hover:scale-105 transition duration-300" />
                      ) : (
                        <div className="absolute inset-0 grid place-items-center text-text-3 text-xs text-center px-2">
                          No poster
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-3 pt-10">
                        <p className="text-text-1 text-sm truncate">{item.title}</p>
                        {item.watched && (
                          <p className="text-go text-mono text-[10px] uppercase tracking-wider mt-0.5">✓ watched</p>
                        )}
                      </div>
                    </Link>

                    {/* Action buttons */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWatched(item);
                        }}
                        title={item.watched ? "Mark unwatched" : "Mark watched"}
                        className={`w-8 h-8 rounded-full grid place-items-center border text-xs btn-press transition ${
                          item.watched
                            ? "bg-go text-black border-go"
                            : "bg-black/80 text-text-1 border-border-light hover:border-go hover:text-go"
                        }`}
                      >
                        ✓
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          remove(item);
                        }}
                        title="Remove"
                        className="w-8 h-8 rounded-full grid place-items-center bg-black/80 border border-border-light text-text-1 hover:border-skip hover:text-skip text-xs btn-press transition"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
