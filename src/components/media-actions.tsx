"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Check, Loader2 } from "lucide-react";
import { StarRater } from "@/components/star-rater";

interface ActionsProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  initialInWatchlist: boolean;
  initialVerdict: string | null;
  initialRating: number | null;
}

export function MediaActions(props: ActionsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [inList, setInList] = useState(props.initialInWatchlist);
  const [verdict, setVerdict] = useState<string | null>(props.initialVerdict);
  const [rating, setRating] = useState<number | null>(props.initialRating);
  const [busy, setBusy] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  function requireLogin() {
    if (!session) {
      router.push("/login");
      return false;
    }
    return true;
  }

  function flashSaved() {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  }

  async function toggleWatchlist() {
    if (!requireLogin()) return;
    setBusy(true);
    const next = !inList;
    setInList(next);
    try {
      const res = await fetch("/api/watchlist", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: props.tmdbId,
          mediaType: props.mediaType,
          title: props.title,
          poster: props.poster,
        }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setInList(!next);
    } finally {
      setBusy(false);
    }
  }

  async function saveReview(updates: { verdict?: string; rating?: number | null }) {
    if (!requireLogin()) return;
    if (busy) return;
    setBusy(true);

    const body = {
      tmdbId: props.tmdbId,
      mediaType: props.mediaType,
      title: props.title,
      poster: props.poster,
      verdict: updates.verdict ?? verdict,
      rating: updates.rating !== undefined ? updates.rating : rating,
    };

    if (!body.verdict) {
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      flashSaved();
      startTransition(() => router.refresh());
    } catch {
      // revert optimistic
      setVerdict(props.initialVerdict);
      setRating(props.initialRating);
    } finally {
      setBusy(false);
    }
  }

  async function setMyVerdict(v: string) {
    setVerdict(v);
    await saveReview({ verdict: v });
  }

  async function setMyRating(r: number) {
    const newR = r === 0 ? null : r;
    setRating(newR);
    if (verdict) {
      await saveReview({ rating: newR });
    } else {
      // suggest a verdict from the rating
      const inferred = newR === null ? null : newR >= 7 ? "go-for-it" : newR >= 5 ? "timepass" : "skip-it";
      if (inferred) {
        setVerdict(inferred);
        await saveReview({ verdict: inferred, rating: newR });
      }
    }
  }

  const verdicts = [
    { id: "go-for-it", label: "Go for it", c: "brut-acid" },
    { id: "timepass", label: "Timepass", c: "brut-tangerine" },
    { id: "skip-it", label: "Skip it", c: "brut-pink" },
  ];

  return (
    <div className="mt-6 space-y-6">
      {/* WATCHLIST */}
      <button
        onClick={toggleWatchlist}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-xl ${
          inList ? "brut-cobalt" : "brut-cream"
        } brut px-5 py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-60`}
      >
        {busy ? (
          <Loader2 size={18} className="animate-spin" />
        ) : inList ? (
          <Check size={18} />
        ) : (
          <Bookmark size={18} />
        )}
        {inList ? "On your watchlist" : "Add to watchlist"}
      </button>

      {/* STAR RATING */}
      <div className="rounded-2xl bg-cream p-5 brut-soft">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-widest text-ink/60">
            Your rating
          </div>
          {savedFlash && (
            <span className="rounded-full bg-acid px-2 py-0.5 text-[10px] font-bold uppercase brut-soft scale-in">
              Saved ✓
            </span>
          )}
        </div>
        <StarRater value={rating} onChange={setMyRating} disabled={busy} />
      </div>

      {/* VERDICT */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-ink/60">
          Your verdict
        </div>
        <div className="grid grid-cols-3 gap-2">
          {verdicts.map((v) => {
            const active = verdict === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setMyVerdict(v.id)}
                disabled={busy}
                className={`rounded-xl px-2 py-3 text-xs font-bold uppercase tracking-wider brut transition disabled:opacity-60 ${
                  active ? v.c : "brut-cream opacity-70 hover:opacity-100"
                }`}
              >
                {v.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
