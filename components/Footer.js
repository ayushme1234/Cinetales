import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="mt-24 border-t border-[var(--border)] bg-[#080808]"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="container-x py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-2xl text-[var(--accent)]">C</span>
              <span className="font-display text-lg">CineTales</span>
            </div>
            <p className="text-sm text-[var(--text-2)] max-w-xs leading-relaxed">
              Find tales that matter. Track films, watch trailers, discover where to stream — one tab.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest2 text-[var(--text-3)] mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/discover" className="text-[var(--text-2)] hover:text-[var(--accent)]">Discover</Link></li>
              <li><Link href="/trending" className="text-[var(--text-2)] hover:text-[var(--accent)]">Trending</Link></li>
              <li><Link href="/vibes" className="text-[var(--text-2)] hover:text-[var(--accent)]">VibesAI</Link></li>
              <li><Link href="/match" className="text-[var(--text-2)] hover:text-[var(--accent)]">AI Match</Link></li>
              <li><Link href="/search" className="text-[var(--text-2)] hover:text-[var(--accent)]">Search</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest2 text-[var(--text-3)] mb-3">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/profile" className="text-[var(--text-2)] hover:text-[var(--accent)]">Profile</Link></li>
              <li><Link href="/watchlist" className="text-[var(--text-2)] hover:text-[var(--accent)]">Watchlist</Link></li>
              <li><Link href="/login" className="text-[var(--text-2)] hover:text-[var(--accent)]">Sign in</Link></li>
              <li><Link href="/about" className="text-[var(--text-2)] hover:text-[var(--accent)]">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest2 text-[var(--text-3)] mb-3">
              Built with
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-2)]">
              <li>TMDB · data</li>
              <li>Groq · AI</li>
              <li>Next.js · framework</li>
              <li>Vercel · hosting</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-[var(--text-3)] font-mono">
            © {new Date().getFullYear()} CineTales · Powered by TMDB
          </p>
          <p className="text-xs text-[var(--text-3)] font-mono">
            Built by <span className="text-[var(--accent)]">Ayush</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
