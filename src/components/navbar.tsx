"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, User, LogOut, Bookmark } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const navLinks = [
    { href: "/discover", label: "Discover" },
    { href: "/vibes", label: "Vibes", badge: "AI" },
    { href: "/trending", label: "Trending" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-[2.5px] border-ink bg-cream/85 backdrop-blur-strong">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-electric text-cream brut-soft transition-transform duration-300 group-hover:rotate-[-8deg]">
            <span className="display-xl text-lg leading-none">C</span>
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 animate-pulse rounded-full bg-acid" />
          </span>
          <span className="display-xl text-2xl tracking-tight">CineTales</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((l) => {
            const active = pathname === l.href || pathname?.startsWith(l.href + "/");
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative px-3 py-2 text-sm font-bold transition ${
                  active ? "text-electric" : "text-ink hover:text-electric"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  {l.label}
                  {l.badge && (
                    <span className="rounded-full bg-acid px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink brut-soft">
                      {l.badge}
                    </span>
                  )}
                </span>
                {active && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-[3px] rounded-full bg-electric" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="grid h-10 w-10 place-items-center rounded-lg brut brut-cream md:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </Link>

          {status === "loading" ? (
            <div className="h-10 w-24 shimmer rounded-lg" />
          ) : session?.user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 rounded-lg brut brut-cream px-3 py-2"
              >
                {session.user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={session.user.image}
                    alt=""
                    className="h-6 w-6 rounded-full border-2 border-ink"
                  />
                ) : (
                  <User size={18} />
                )}
                <span className="hidden text-sm font-bold sm:inline">
                  {session.user.name?.split(" ")[0]}
                </span>
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-cream p-2 brut scale-in">
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-acid"
                    onClick={() => setOpen(false)}
                  >
                    <User size={16} /> My profile
                  </Link>
                  <Link
                    href="/watchlist"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition hover:bg-acid"
                    onClick={() => setOpen(false)}
                  >
                    <Bookmark size={16} /> Watchlist
                  </Link>
                  <div className="my-1 h-px bg-ink/10" />
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-electric hover:text-cream"
                  >
                    <LogOut size={16} /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg brut brut-pink px-4 py-2 text-sm font-bold uppercase tracking-wider"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
