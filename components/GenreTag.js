import Link from "next/link";

export default function GenreTag({ genre, id, type = "movie" }) {
  const href = id ? `/discover?genre=${id}&type=${type}` : "/discover";
  return (
    <Link
      href={href}
      className="inline-block text-xs font-medium uppercase tracking-wider px-3 py-1 rounded-full border border-[var(--border-light)] text-[var(--text-2)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
    >
      {genre}
    </Link>
  );
}
