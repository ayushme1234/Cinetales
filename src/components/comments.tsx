"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, Trash2, Loader2, MessageSquare } from "lucide-react";

interface Comment {
  id: string;
  text: string | null;
  verdict: string;
  rating: number | null;
  likes: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface Props {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  poster: string | null;
  initialComments: Comment[];
  myVerdict: string | null;
  myCommentText: string | null;
  myCommentId: string | null;
}

const VERDICT_META: Record<string, { label: string; c: string }> = {
  "go-for-it": { label: "Go for it", c: "brut-acid" },
  timepass: { label: "Timepass", c: "brut-tangerine" },
  "skip-it": { label: "Skip it", c: "brut-pink" },
};

export function Comments({
  tmdbId,
  mediaType,
  title,
  poster,
  initialComments,
  myVerdict,
  myCommentText,
  myCommentId,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [text, setText] = useState(myCommentText || "");
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState(initialComments);

  const myUserId = (session?.user as any)?.id;

  async function postComment() {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!myVerdict) {
      alert("Pick your verdict first (Go for it / Timepass / Skip it)");
      return;
    }
    if (!text.trim()) return;

    setPosting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId,
          mediaType,
          title,
          poster,
          text: text.trim(),
        }),
      });
      if (!res.ok) throw new Error();
      startTransition(() => router.refresh());
    } catch {
      alert("Failed to post. Try again.");
    } finally {
      setPosting(false);
    }
  }

  async function deleteComment(id: string) {
    if (!confirm("Delete your comment?")) return;
    try {
      const res = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setComments((c) => c.filter((x) => x.id !== id));
      startTransition(() => router.refresh());
    } catch {
      alert("Failed to delete.");
    }
  }

  async function likeComment(id: string) {
    if (!session) {
      router.push("/login");
      return;
    }
    // optimistic
    setComments((c) => c.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)));
    try {
      await fetch(`/api/comments?id=${id}`, { method: "PATCH" });
    } catch {
      setComments((c) => c.map((x) => (x.id === id ? { ...x, likes: x.likes - 1 } : x)));
    }
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-12">
      <div className="flex items-center gap-3">
        <h2 className="display-xl text-3xl md:text-5xl">The discourse.</h2>
        <span className="rounded-full bg-electric px-3 py-1 text-sm font-bold text-cream brut">
          {comments.length}
        </span>
      </div>

      {/* WRITE BOX */}
      <div className="mt-8 rounded-2xl bg-cream p-5 brut">
        {!session ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-bold">Want to drop your take?</div>
              <div className="text-sm text-ink/60">Sign in with Google in one tap.</div>
            </div>
            <Link
              href="/login"
              className="shrink-0 rounded-xl brut brut-pink px-4 py-2 font-bold uppercase"
            >
              Sign in
            </Link>
          </div>
        ) : !myVerdict ? (
          <div className="rounded-xl bg-acid p-4 text-sm font-medium">
            <span className="font-bold">Step 1:</span> tap your verdict above (Go for it / Timepass /
            Skip it). <span className="font-bold">Step 2:</span> drop your comment here.
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-center gap-3">
              {session.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt=""
                  className="h-10 w-10 rounded-full border-[2.5px] border-ink"
                />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-cobalt text-cream brut">
                  {session.user?.name?.[0]}
                </div>
              )}
              <div>
                <div className="font-bold">{session.user?.name}</div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`rounded-full ${VERDICT_META[myVerdict].c} px-2 py-0.5 font-bold uppercase brut-soft`}>
                    {VERDICT_META[myVerdict].label}
                  </span>
                </div>
              </div>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              placeholder="What did you actually think? No spoilers without a warning, please."
              rows={3}
              className="w-full resize-none rounded-xl border-[2.5px] border-ink bg-cream p-3 font-medium outline-none focus:bg-acid"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-ink/50">{text.length}/1000</span>
              <button
                onClick={postComment}
                disabled={posting || !text.trim()}
                className="inline-flex items-center gap-2 rounded-xl brut brut-pink px-5 py-2 font-bold uppercase disabled:opacity-50"
              >
                {posting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <MessageSquare size={16} />
                )}
                {myCommentId ? "Update" : "Post"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* COMMENT LIST */}
      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <div className="rounded-2xl bg-cream p-8 text-center brut">
            <MessageSquare className="mx-auto" size={36} />
            <p className="display-xl mt-3 text-2xl">Crickets.</p>
            <p className="text-ink/60">Be the first to say something.</p>
          </div>
        ) : (
          comments.map((c) => {
            const v = VERDICT_META[c.verdict];
            const isMine = c.user.id === myUserId;
            return (
              <article key={c.id} className="rounded-2xl bg-cream p-5 brut">
                <header className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {c.user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.user.image}
                        alt=""
                        className="h-10 w-10 rounded-full border-[2.5px] border-ink"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-cobalt text-cream brut">
                        {c.user.name?.[0] || "?"}
                      </div>
                    )}
                    <div>
                      <div className="font-bold">
                        {c.user.name || "Anonymous"}
                        {isMine && <span className="ml-2 text-xs text-ink/50">(you)</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink/60">
                        <span
                          className={`rounded-full ${v?.c || "brut-cream"} px-2 py-0.5 font-bold uppercase brut-soft`}
                        >
                          {v?.label || c.verdict}
                        </span>
                        {c.rating !== null && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-acid px-2 py-0.5 font-bold brut-soft">
                            ★ {c.rating.toFixed(1)}
                          </span>
                        )}
                        <span>· {timeAgo(c.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {isMine && (
                    <button
                      onClick={() => deleteComment(c.id)}
                      className="rounded-lg p-2 text-ink/50 hover:bg-electric hover:text-cream"
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </header>
                {c.text && (
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                )}
                <footer className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => likeComment(c.id)}
                    className="flex items-center gap-1 rounded-full bg-cream px-3 py-1 text-sm font-bold brut hover:brut-pink"
                  >
                    <Heart size={14} /> {c.likes}
                  </button>
                </footer>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}
