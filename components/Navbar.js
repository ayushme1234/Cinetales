// CineTales — Navbar inspired by Moctale.
// Logo + β badge on left, icon-based nav on desktop, profile/avatar on right.
// Transparent at top → solid blur on scroll. Mobile drawer below 768px.

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";

const NAV = [
  { href: "/discover", label: "Discover", icon: CompassIcon },
  { href: "/trending", label: "Trending", icon: FlameIcon },
  { href: "/vibes", label: "VibesAI", icon: SparklesIcon },
  { href: "/match", label: "AI Match", icon: BridgeIcon },
];

export default function Navbar() {
  const router = useRouter();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
  }, [router.asPath]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-bg/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container-x flex items-center h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <Logomark className="w-8 h-8 text-accent transition-transform group-hover:scale-110" />
          <span className="font-display text-xl md:text-2xl tracking-tight">
            CineTales
          </span>
          <span className="hidden sm:inline-block ml-1 text-mono text-[10px] uppercase tracking-widest text-accent/80 bg-accent-dim px-1.5 py-0.5 rounded">
            β
          </span>
        </Link>

        {/* Desktop nav — icons in pill cluster */}
        <nav className="hidden md:flex items-center ml-auto gap-1 mr-3">
          {NAV.map((item) => {
            const active = router.asPath.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-full text-sm transition btn-press ${
                  active
                    ? "text-accent bg-accent-dim"
                    : "text-text-2 hover:text-text-1 hover:bg-surface"
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ALWAYS-VISIBLE search icon — works on mobile + desktop */}
        <Link
          href="/search"
          className="ml-auto md:ml-0 mr-2 md:mr-3 w-10 h-10 grid place-items-center rounded-full bg-surface border border-border text-text-1 hover:border-accent hover:text-accent btn-press"
          aria-label="Search"
          title="Search"
        >
          <SearchIcon className="w-4 h-4" />
        </Link>

        {/* Profile / auth — desktop */}
        <div className="hidden md:block relative">
          {session?.user ? (
            <>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 p-1 pr-3 rounded-full bg-surface border border-border hover:border-accent btn-press"
              >
                <Avatar user={session.user} size={32} />
              </button>
              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-elevated border border-border-light rounded-xl overflow-hidden shadow-2xl z-50 animate-fade-in">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-text-3 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2.5 text-sm hover:bg-surface"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/watchlist"
                      className="block px-4 py-2.5 text-sm hover:bg-surface"
                    >
                      Watchlist
                    </Link>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2.5 text-sm text-skip hover:bg-surface border-t border-border"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover btn-press"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="hidden lg:inline-block px-5 py-2 rounded-full border border-border-light text-sm hover:border-accent btn-press"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button — search is handled by the always-visible button above */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="md:hidden p-2 rounded-lg text-text-1 hover:bg-surface btn-press"
          aria-label="Menu"
        >
          {menuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-border animate-fade-in">
          <div className="container-x py-4 space-y-1">
            {/* Filter Search out — it has its own dedicated icon at the top */}
            {NAV.filter((item) => item.href !== "/search").map((item) => {
              const Icon = item.icon;
              const active = router.asPath.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                    active
                      ? "bg-accent-dim text-accent"
                      : "text-text-1 hover:bg-surface"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-3 mt-3 border-t border-border">
              {session?.user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-1 hover:bg-surface"
                  >
                    <Avatar user={session.user} size={28} />
                    <span>Profile</span>
                  </Link>
                  <Link
                    href="/watchlist"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-1 hover:bg-surface"
                  >
                    <BookmarkIcon className="w-5 h-5" />
                    <span>Watchlist</span>
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-skip hover:bg-surface text-left"
                  >
                    <span>Sign out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full text-center px-4 py-3 rounded-xl bg-accent text-white font-medium"
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

/* ─── Avatar ──────────────────────────────────────────────────────── */
function Avatar({ user, size = 32 }) {
  if (user.image) {
    return (
      <Image
        src={user.image}
        alt={user.name || "Profile"}
        width={size}
        height={size}
        className="rounded-full"
      />
    );
  }
  const letter = (user.name || user.email || "?")[0].toUpperCase();
  return (
    <span
      className="grid place-items-center rounded-full bg-elevated border border-border-light text-sm"
      style={{ width: size, height: size }}
    >
      {letter}
    </span>
  );
}

/* ─── Logomark ────────────────────────────────────────────────────── */
function Logomark({ className }) {
  // Stylized "C" with film-strip dots — Moctale-inspired wordmark feel
  return (
    <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
      <path d="M16 4C9.4 4 4 9.4 4 16s5.4 12 12 12c3.3 0 6.3-1.3 8.5-3.5l-3-3a8 8 0 1 1 0-11l3-3A11.97 11.97 0 0 0 16 4z" />
      <circle cx="22" cy="16" r="2.4" />
    </svg>
  );
}

/* ─── Icons ───────────────────────────────────────────────────────── */
function CompassIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}
function FlameIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}
function SparklesIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.8 2.4L22 17l-2.2.6L19 20l-.8-2.4L16 17l2.2-.6L19 14z" />
      <path d="M5 16l.6 1.7L7 18l-1.4.4L5 20l-.6-1.6L3 18l1.4-.3L5 16z" />
    </svg>
  );
}
function BridgeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="12" r="3" />
      <path d="M9 12h6" />
    </svg>
  );
}
function SearchIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function BookmarkIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function MenuIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function CloseIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}
