import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t-[2.5px] border-ink bg-ink text-cream">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="display-xl text-3xl">CineTales</div>
            <p className="mt-3 max-w-xs text-cream/70">
              Find tales that matter. Track, rate, and decide where to watch — all in one tab.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="https://github.com/ayushme1234" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="grid h-10 w-10 place-items-center rounded-lg border-2 border-cream/30 transition hover:border-acid hover:text-acid">
                <Github size={18} />
              </a>
              <a href="https://www.linkedin.com/in/ayush-8b9623223/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="grid h-10 w-10 place-items-center rounded-lg border-2 border-cream/30 transition hover:border-acid hover:text-acid">
                <Linkedin size={18} />
              </a>
              <a href="mailto:[email protected]" aria-label="Email" className="grid h-10 w-10 place-items-center rounded-lg border-2 border-cream/30 transition hover:border-acid hover:text-acid">
                <Mail size={18} />
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-acid">Explore</h4>
            <ul className="mt-3 space-y-2 text-cream/80">
              <li><Link href="/trending" className="hover:text-electric">Trending</Link></li>
              <li><Link href="/discover" className="hover:text-electric">Discover</Link></li>
              <li>
                <Link href="/vibes" className="inline-flex items-center gap-1.5 hover:text-electric">
                  Vibes
                  <span className="rounded-full bg-acid px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink">AI</span>
                </Link>
              </li>
              <li><Link href="/search" className="hover:text-electric">Search</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-acid">CineTales</h4>
            <ul className="mt-3 space-y-2 text-cream/80">
              <li><Link href="/about" className="hover:text-electric">About the creator</Link></li>
              <li><Link href="/login" className="hover:text-electric">Sign in</Link></li>
              <li><Link href="/profile" className="hover:text-electric">Profile</Link></li>
              <li><Link href="/watchlist" className="hover:text-electric">Watchlist</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-cream/20 pt-6 text-sm text-cream/60 md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} CineTales · Powered by TMDB & Llama 3.3</p>
          <p className="font-mono text-xs">
            Designed &amp; built by{" "}
            <a
              href="https://nextfolio-rouge.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-acid hover:underline"
            >
              Ayush
            </a>{" "}
            · Kolkata, IN
          </p>
        </div>
      </div>
    </footer>
  );
}
