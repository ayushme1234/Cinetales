// CineTales — /profile page (Moctale-style).
// Big avatar + stats + Reviews/Collections tabs. 4-tier vibe filter pills.
// List/grid view toggle for ratings.

import { useEffect, useState, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import LoadingSpinner from "../components/LoadingSpinner";

const VIBE_LABEL = {
  skip: { label: "Skip", color: "text-skip", bg: "bg-skip", border: "border-skip" },
  mid: { label: "Timepass", color: "text-mid", bg: "bg-mid", border: "border-mid" },
  go: { label: "Go For It", color: "text-go", bg: "bg-go", border: "border-go" },
  perfection: { label: "Perfection", color: "text-perfection", bg: "bg-perfection", border: "border-perfection" },
};

const VIBE_FILTERS = [
  { k: "all", label: "All" },
  { k: "skip", label: "Skip" },
  { k: "mid", label: "Timepass" },
  { k: "go", label: "Go For It" },
  { k: "perfection", label: "Perfection" },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState("ratings");
  const [vibeFilter, setVibeFilter] = useState("all");
  const [view, setView] = useState("list"); // "list" or "grid"
  const [ratings, setRatings] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/profile");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [rRes, wRes] = await Promise.all([
          fetch("/api/ratings"),
          fetch("/api/watchlist"),
        ]);
        const rData = rRes.ok ? await rRes.json() : [];
        const wData = wRes.ok ? await wRes.json() : [];
        if (!cancelled) {
          setRatings(Array.isArray(rData) ? rData : []);
          setWatchlist(Array.isArray(wData) ? wData : []);
        }
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

  const filteredRatings = useMemo(() => {
    if (vibeFilter === "all") return ratings;
    return ratings.filter((r) => r.vibe === vibeFilter);
  }, [ratings, vibeFilter]);

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

  const user = session?.user || {};
  const username = (user.email || "").split("@")[0];

  // Verdict counts for stats
  const counts = {
    perfection: ratings.filter((r) => r.vibe === "perfection").length,
    go: ratings.filter((r) => r.vibe === "go").length,
    mid: ratings.filter((r) => r.vibe === "mid").length,
    skip: ratings.filter((r) => r.vibe === "skip").length,
  };

  return (
    <>
      <Head>
        <title>{user.name || "Profile"} — CineTales</title>
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24 purple-wash-corner">
        <div className="container-x grid lg:grid-cols-[320px_1fr] gap-8">
          {/* ──── Left rail: user card ──── */}
          <aside className="lg:sticky lg:top-28 self-start">
            <div className="bg-surface border border-border rounded-2xl p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-28 h-28 rounded-full overflow-hidden bg-elevated border-2 border-border-light shrink-0 mb-4">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "Profile"}
                      fill
                      sizes="112px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-text-1 font-display text-4xl">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <h1 className="font-display text-2xl text-text-1 leading-tight">
                  {user.name || "Cinephile"}
                </h1>
                {username && (
                  <p className="text-text-3 text-sm mt-0.5">@{username}</p>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-bg border border-border rounded-xl px-3 py-3 text-center">
                  <p className="font-display text-2xl text-text-1">{ratings.length}</p>
                  <p className="text-mono text-[10px] uppercase tracking-wider text-text-3 mt-0.5">
                    Ratings
                  </p>
                </div>
                <div className="bg-bg border border-border rounded-xl px-3 py-3 text-center">
                  <p className="font-display text-2xl text-text-1">{watchlist.length}</p>
                  <p className="text-mono text-[10px] uppercase tracking-wider text-text-3 mt-0.5">
                    Watchlist
                  </p>
                </div>
              </div>

              {/* Verdict breakdown */}
              {ratings.length > 0 && (
                <div className="mt-5 pt-5 border-t border-border space-y-2">
                  <p className="text-mono text-[10px] uppercase tracking-widest2 text-text-3 mb-2">
                    Your verdicts
                  </p>
                  {[
                    { k: "perfection", l: "Perfection", c: counts.perfection },
                    { k: "go", l: "Go For It", c: counts.go },
                    { k: "mid", l: "Timepass", c: counts.mid },
                    { k: "skip", l: "Skip", c: counts.skip },
                  ].map((v) => {
                    const v2 = VIBE_LABEL[v.k];
                    const pct = ratings.length ? (v.c / ratings.length) * 100 : 0;
                    return (
                      <div key={v.k}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className={`${v2.color} font-medium`}>{v.l}</span>
                          <span className="text-text-3 font-mono">{v.c}</span>
                        </div>
                        <div className="h-1 bg-elevated rounded-full overflow-hidden">
                          <div
                            className={`h-full ${v2.bg} transition-all`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full mt-6 px-4 py-2.5 rounded-full border border-border-light text-text-2 hover:text-skip hover:border-skip text-sm transition btn-press"
              >
                Sign out
              </button>
            </div>
          </aside>

          {/* ──── Main content ──── */}
          <div className="min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-border mb-6">
              {[
                { v: "ratings", l: "Ratings", n: ratings.length },
                { v: "watchlist", l: "Watchlist", n: watchlist.length },
              ].map((opt) => (
                <button
                  key={opt.v}
                  onClick={() => setTab(opt.v)}
                  className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
                    tab === opt.v
                      ? "border-accent text-text-1"
                      : "border-transparent text-text-2 hover:text-text-1"
                  }`}
                >
                  {opt.l} <span className="text-text-3 font-mono ml-1">({opt.n})</span>
                </button>
              ))}
            </div>

            {/* Filter row (only on ratings tab) */}
            {tab === "ratings" && ratings.length > 0 && (
              <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  {VIBE_FILTERS.map((f) => (
                    <button
                      key={f.k}
                      onClick={() => setVibeFilter(f.k)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider btn-press transition ${
                        vibeFilter === f.k
                          ? "bg-accent text-white"
                          : "bg-surface border border-border text-text-2 hover:text-text-1 hover:border-border-light"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div className="flex bg-surface border border-border rounded-lg p-0.5">
                  <button
                    onClick={() => setView("list")}
                    className={`p-2 rounded-md ${view === "list" ? "bg-elevated text-text-1" : "text-text-3 hover:text-text-1"}`}
                    aria-label="List view"
                  >
                    <ListIcon />
                  </button>
                  <button
                    onClick={() => setView("grid")}
                    className={`p-2 rounded-md ${view === "grid" ? "bg-elevated text-text-1" : "text-text-3 hover:text-text-1"}`}
                    aria-label="Grid view"
                  >
                    <GridIcon />
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="py-20 grid place-items-center">
                <LoadingSpinner />
              </div>
            ) : tab === "ratings" ? (
              <RatingsView items={filteredRatings} view={view} />
            ) : (
              <WatchlistGrid items={watchlist} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function RatingsView({ items, view }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center bg-surface border border-border rounded-2xl">
        <p className="text-text-2 mb-3">Nothing here yet.</p>
        <Link href="/discover" className="text-accent hover:text-accent-hover">
          Find something to rate →
        </Link>
      </div>
    );
  }

  if (view === "grid") {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((r) => {
          const href = r.media_type === "tv" ? `/tv/${r.media_id}` : `/movie/${r.media_id}`;
          const vibe = VIBE_LABEL[r.vibe];
          const poster = r.poster_path
            ? `https://image.tmdb.org/t/p/w342${r.poster_path}`
            : null;
          return (
            <Link
              key={`${r.media_type}-${r.media_id}`}
              href={href}
              className="group block bg-surface border border-border rounded-xl p-3 hover:border-border-light transition"
            >
              <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-elevated mb-3">
                {poster ? (
                  <Image
                    src={poster}
                    alt={r.title || ""}
                    fill
                    sizes="220px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-text-3 text-xs px-2 text-center">
                    {r.title || `#${r.media_id}`}
                  </div>
                )}
                {vibe && (
                  <span
                    className={`absolute top-2 left-2 ${vibe.bg} text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full`}
                    style={{ color: r.vibe === "mid" ? "#0a0710" : "#fff" }}
                  >
                    {vibe.label}
                  </span>
                )}
                {r.score != null && (
                  <span className="absolute top-2 right-2 bg-accent text-white text-[10px] font-mono px-2 py-0.5 rounded-full">
                    {Number(r.score).toFixed(1)}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-1 truncate">
                {r.title || `${r.media_type === "tv" ? "Series" : "Film"} #${r.media_id}`}
              </p>
              <p className="font-mono text-[10px] text-text-3 mt-1">
                {new Date(r.rated_at).toLocaleDateString()}
              </p>
            </Link>
          );
        })}
      </div>
    );
  }

  // List view (Moctale-style)
  return (
    <ul className="space-y-2.5">
      {items.map((r) => {
        const href = r.media_type === "tv" ? `/tv/${r.media_id}` : `/movie/${r.media_id}`;
        const vibe = VIBE_LABEL[r.vibe];
        return (
          <li key={`${r.media_type}-${r.media_id}`}>
            <Link
              href={href}
              className="flex items-center gap-4 px-4 py-4 bg-surface border border-border rounded-xl hover:border-border-light transition group"
            >
              <span className="text-mono text-2xl text-accent w-14 text-center shrink-0">
                {r.score != null ? Number(r.score).toFixed(1) : "—"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-text-1 truncate group-hover:text-accent transition">
                  {r.title || `${r.media_type === "tv" ? "Series" : "Film"} · TMDB #${r.media_id}`}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-border text-text-2">
                    {r.media_type === "tv" ? "Series" : "Film"}
                  </span>
                  {vibe && (
                    <span
                      className="text-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: `var(--${r.vibe})`,
                        color: r.vibe === "mid" ? "#0a0710" : "#fff",
                      }}
                    >
                      {vibe.label}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-text-3 text-xs hidden sm:block shrink-0">
                {new Date(r.rated_at).toLocaleDateString()}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function WatchlistGrid({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="py-16 text-center bg-surface border border-border rounded-2xl">
        <p className="text-text-2 mb-3">Your watchlist is empty.</p>
        <Link href="/discover" className="text-accent hover:text-accent-hover">
          Start adding films →
        </Link>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((w) => {
        const href = w.media_type === "tv" ? `/tv/${w.media_id}` : `/movie/${w.media_id}`;
        const poster = w.poster_path ? `https://image.tmdb.org/t/p/w342${w.poster_path}` : null;
        return (
          <Link
            key={`${w.media_type}-${w.media_id}`}
            href={href}
            className="group block relative aspect-[2/3] rounded-lg overflow-hidden bg-elevated border border-border hover:border-border-light transition card-hover"
          >
            {poster ? (
              <Image src={poster} alt={w.title || ""} fill sizes="220px" className="object-cover group-hover:scale-105 transition duration-300" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-text-3 text-xs text-center px-2">
                No poster
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/95 via-bg/60 to-transparent p-3">
              <p className="text-text-1 text-sm truncate">{w.title}</p>
              {w.watched && (
                <p className="text-go text-mono text-[10px] uppercase tracking-wider mt-0.5">✓ watched</p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function ListIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}
function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}
