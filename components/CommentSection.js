// CineTales — CommentSection.
// Global comments per movie/TV. Auto-seeded with 4 AI comments on first load.
// Logged-in users can post; anyone can read. Users can delete their own.

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSession, signIn } from "next-auth/react";

export default function CommentSection({ mediaId, mediaType, title, year, genres = [] }) {
  const { data: session, status } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mediaId || !mediaType) return;
    setLoading(true);
    const params = new URLSearchParams({
      mediaId: String(mediaId),
      mediaType,
      title: title || "",
      year: year ? String(year) : "",
      genres: genres.join(","),
    });
    fetch(`/api/comments?${params}`)
      .then((r) => r.json())
      .then((data) => setComments(data.comments || []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaId, mediaType]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status !== "authenticated") {
      signIn("google", {
        callbackUrl: typeof window !== "undefined" ? window.location.pathname : "/",
      });
      return;
    }
    const t = text.trim();
    if (!t) return;
    setPosting(true);
    setError("");
    try {
      const r = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId, mediaType, content: t }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Failed");
      setComments((prev) => [data.comment, ...prev]);
      setText("");
    } catch (e) {
      setError(e.message);
    } finally {
      setPosting(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this comment?")) return;
    try {
      const r = await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
      if (r.ok) setComments((prev) => prev.filter((c) => c.id !== id));
    } catch {}
  };

  const myUserId = session?.user?.id || session?.user?.email || null;

  return (
    <section className="container-x mt-16">
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest2 text-accent mb-2">
            // discussion
          </p>
          <h2 className="font-display text-2xl md:text-4xl leading-tight">
            Comments{" "}
            <span className="text-text-3 font-display text-xl md:text-2xl">
              ({comments.filter((c) => !c.is_seed || true).length})
            </span>
          </h2>
        </div>
      </div>

      {/* Composer */}
      <div className="rounded-2xl bg-surface border border-border p-4 md:p-5 mb-6">
        {status === "authenticated" ? (
          <form onSubmit={onSubmit} className="flex gap-3 items-start">
            <UserAvatar
              src={session.user.image}
              name={session.user.name}
              size={36}
            />
            <div className="flex-1 min-w-0">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`What did you think of ${title || "it"}?`}
                rows={2}
                maxLength={600}
                className="w-full bg-elevated border border-border rounded-xl px-3 py-2.5 text-sm text-text-1 placeholder:text-text-3 focus:border-accent focus:outline-none resize-none"
                style={{
                  backgroundColor: "var(--elevated)",
                  color: "var(--text-1)",
                  caretColor: "var(--accent)",
                }}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] text-text-3">
                  {text.length}/600
                </span>
                {error && (
                  <span className="text-xs text-skip mr-2">{error}</span>
                )}
                <button
                  type="submit"
                  disabled={posting || !text.trim()}
                  className="px-4 py-2 rounded-full bg-accent text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-hover btn-press"
                >
                  {posting ? "Posting…" : "Post"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-text-2 mb-3">
              Sign in to join the conversation.
            </p>
            <button
              onClick={() =>
                signIn("google", {
                  callbackUrl:
                    typeof window !== "undefined" ? window.location.pathname : "/",
                })
              }
              className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover btn-press"
            >
              Sign in with Google
            </button>
          </div>
        )}
      </div>

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-surface border border-border p-4 md:p-5">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full shimmer" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/4 rounded shimmer" />
                  <div className="h-3 w-3/4 rounded shimmer" />
                  <div className="h-3 w-1/2 rounded shimmer" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl bg-surface border border-border p-8 text-center">
          <p className="text-text-2">No comments yet.</p>
          <p className="text-sm text-text-3 mt-1">Be the first to share your thoughts.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isMine={myUserId && c.user_id === myUserId}
              onDelete={() => onDelete(c.id)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

/* ─── One comment ──────────────────────────────────────── */
function CommentItem({ comment, isMine, onDelete }) {
  return (
    <li className="rounded-2xl bg-surface border border-border p-4 md:p-5 hover:border-border-light transition">
      <div className="flex gap-3">
        <UserAvatar
          src={comment.author_picture}
          name={comment.author_name}
          size={36}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-sm font-medium text-text-1 truncate">
              {comment.author_name}
            </span>
            {comment.is_seed && (
              <span
                title="AI-curated community sample"
                className="text-[9px] font-mono uppercase tracking-widest text-accent bg-accent-dim border border-accent/30 px-1.5 py-0.5 rounded-full"
              >
                ✦ community
              </span>
            )}
            <span className="text-xs text-text-3">·</span>
            <span className="text-xs text-text-3">
              {timeAgo(comment.created_at)}
            </span>
            {isMine && (
              <button
                onClick={onDelete}
                className="ml-auto text-xs text-text-3 hover:text-skip transition"
                aria-label="Delete comment"
                title="Delete"
              >
                ×
              </button>
            )}
          </div>
          <p className="text-sm text-text-1 leading-relaxed whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        </div>
      </div>
    </li>
  );
}

/* ─── Avatar (with photo fallback) ─────────────────────── */
function UserAvatar({ src, name, size = 36 }) {
  const [imgErr, setImgErr] = useState(false);
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  const usePhoto = src && !imgErr;

  return (
    <div
      className="relative rounded-full overflow-hidden bg-elevated border border-border shrink-0"
      style={{ width: size, height: size }}
    >
      {usePhoto ? (
        <Image
          src={src}
          alt={name || "User"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={() => setImgErr(true)}
        />
      ) : (
        <div
          className="absolute inset-0 grid place-items-center text-white font-display"
          style={{
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-deep) 100%)",
            fontSize: size * 0.42,
          }}
        >
          {initial}
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ──────────────────────────────────────────── */
function timeAgo(iso) {
  if (!iso) return "";
  const ms = Date.now() - new Date(iso).getTime();
  const s = Math.floor(ms / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 4) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}
