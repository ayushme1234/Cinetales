// CineTales — /about page.
// "About the creator" headline, photo avatar, social pills, no tech stack.

import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>About — CineTales</title>
        <meta
          name="description"
          content="One tab to discover, rate, and track films. Built by Ayush."
        />
      </Head>
      <Navbar />
      <main className="min-h-screen bg-bg pt-24 pb-24 purple-wash-corner">
        <div className="container-x max-w-3xl relative">
          {/* ─── HERO ────────────────────────────────────── */}
          <header className="mb-14 animate-slide-up">
            <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">
              // the story
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-text-1 leading-[0.95]">
              CineTales.
            </h1>
          </header>

          {/* ─── ABOUT THE PROJECT ──────────────────────── */}
          <section className="space-y-6 text-text-2 text-lg leading-relaxed mb-16">
            <p>
              <span className="text-text-1">One tab.</span> Discover any movie or show.
              Watch the trailer. Save it. Rate it. Move on with your day.
            </p>
            <p>
              No paywalls. No login walls for browsing. No meaningless five-star averages.
              Just four honest verdicts —{" "}
              <span className="text-skip font-medium">skip</span>,{" "}
              <span className="text-mid font-medium">timepass</span>,{" "}
              <span className="text-go font-medium">go for it</span>, or{" "}
              <span className="text-perfection font-medium">perfection</span>{" "}
              — and a precise 0&ndash;10 score if you want to be more specific.
            </p>
            <p>
              CineTales pulls fresh data from TMDB, runs vibe-based recommendations
              through Groq + Llama, and shows you exactly where every title is streaming
              in your region. That&rsquo;s the whole app.
            </p>
          </section>

          {/* ─── ABOUT THE CREATOR ──────────────────────── */}
          <section className="relative rounded-3xl bg-surface border border-border p-8 md:p-10 mb-16 overflow-hidden">
            <div
              aria-hidden
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-accent-dim blur-3xl pointer-events-none"
            />
            <div className="relative">
              <p className="text-mono text-xs uppercase tracking-[0.25em] text-accent mb-3">
                // the creator
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-text-1 mb-8 leading-tight">
                About the creator.
              </h2>

              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {/* Photo avatar */}
                <div className="shrink-0">
                  <div
                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-accent/40"
                    style={{
                      boxShadow:
                        "0 0 32px -4px var(--accent-glow), 0 8px 24px -8px rgba(0,0,0,0.5)",
                    }}
                  >
                    <Image
                      src="/ayush.jpg"
                      alt="Ayush"
                      fill
                      sizes="(max-width: 768px) 112px, 128px"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="flex-1 min-w-0 space-y-4 text-text-2 leading-relaxed">
                  <p>
                    <span className="text-text-1 font-medium">I&rsquo;m Ayush</span> — a
                    B.Tech ECE student and a Programmer Analyst Trainee at Cognizant
                    working in the Salesforce domain. CineTales is a side project I
                    built because I wanted a single tab where I could figure out what
                    to watch tonight without bouncing between five different apps.
                  </p>
                  <p>
                    I love building polished, fast web tools — usually with vanilla JS
                    or Next.js, never more dependencies than necessary. If you find a
                    bug, hit me up.
                  </p>
                </div>
              </div>

              {/* Social links */}
              <div className="mt-8 flex flex-wrap gap-3">
                <SocialLink
                  href="https://github.com/ayushme1234"
                  label="GitHub"
                  icon={<GithubIcon />}
                />
                <SocialLink
                  href="https://www.linkedin.com/in/ayush280303/"
                  label="LinkedIn"
                  icon={<LinkedInIcon />}
                />
                <SocialLink
                  href="https://www.instagram.com/ayyushh.h/"
                  label="Instagram"
                  icon={<InstagramIcon />}
                />
                <SocialLink
                  href="https://github.com/ayushme1234/Cinetales"
                  label="Source code"
                  icon={<CodeIcon />}
                />
              </div>
            </div>
          </section>

          {/* ─── ATTRIBUTION + CTA ──────────────────────── */}
          <section className="border-t border-border pt-10">
            <p className="text-text-3 text-sm leading-relaxed mb-6">
              Movie & series data from{" "}
              <a
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover"
              >
                The Movie Database (TMDB)
              </a>
              . Streaming availability via JustWatch (through TMDB). AI by{" "}
              <a
                href="https://groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:text-accent-hover"
              >
                Groq
              </a>
              . This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover btn-press"
              >
                Start exploring →
              </Link>
              <Link
                href="/vibes"
                className="px-6 py-3 rounded-full bg-surface border border-border-light text-text-1 hover:border-accent hover:text-accent btn-press"
              >
                ✦ Try VibesAI
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

/* ─── Social link pill ──────────────────────────────────── */
function SocialLink({ href, label, icon }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-elevated border border-border-light text-text-1 hover:border-accent hover:text-accent transition btn-press text-sm"
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}

/* ─── Icons ─────────────────────────────────────────────── */
function GithubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.79 23.4c.6.1.82-.26.82-.58v-2c-3.34.72-4.04-1.6-4.04-1.6-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .1-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.69.83.58A12 12 0 0 0 12 .3" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.99 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}
function CodeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
