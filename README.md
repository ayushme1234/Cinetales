# CineTales

Find tales that matter. A cinematic Next.js app to discover, rate, and track movies and series — with trailers, streaming availability, and **two flagship AI features** powered by Groq + Llama 3.3.

Live: [cinetales-lilac.vercel.app](https://cinetales-lilac.vercel.app/)

---

## Design language

Inspired by Moctale, Spotify, and BookMyShow:

- **Lavender / purple accent** (`#a855f7`) on deep near-black (`#0a0710`) — eye-catching but minimal
- **4 verdict tiers** (matching Moctale): Skip · Timepass · Go For It · **Perfection** ★
- Hero with two opposing scrolling poster walls behind the wordmark
- Spotify-style horizontal scroll rows with arrow controls
- BookMyShow-style "Most Interested This Week" rail with rank numbers + 🔥
- DM Serif Display headings · Outfit body · DM Mono accents
- Generous whitespace, single accent color used sparingly, mobile-first

## Features

- Cinematic dark + lavender UI, fully responsive
- Movie/TV detail pages with TMDB scores, genre vibes, audience %, cast, similar titles
- **Trailer plays inline — no login required** (YouTube embed)
- **Streaming provider cards** prominent on every detail page (Stream / Free / Ads / Rent / Buy) with logos and IN→US→GB region detection
- 4-tier verdict rating (Skip / Timepass / Go For It / Perfection) + precise 0–10 score slider
- Watchlist with watched / unwatched toggle
- Discover with filters (genre, year, rating, sort), URL-synced
- Trending with editorial ranked layout
- Search across films, series, anime

## AI features (✦ Groq + Llama 3.3)

### `/vibes` — VibesAI
Describe a mood ("rainy day comfort watch", "neon cyberpunk vibes"), get 8 films/shows enriched with TMDB posters and one-sentence reasons.

### `/match` — AI Match (NEW)
Enter two films you loved. Get five films that **bridge them tonally** — what makes both special, woven into one recommendation. Each pick comes with TMDB poster, score, and a one-sentence reason.

### AI Pitch (NEW · on every detail page)
"Why watch this?" button → 3 spoiler-free pitches generated in real time. Tells you what kind of film it is and who it's for, never the plot.

## Stack

- **Next.js 14** (Pages Router, JavaScript — no TypeScript)
- **NextAuth.js** with Google OAuth (JWT strategy)
- **Postgres** via raw `pg` (no ORM) — auto-migrating CHECK constraint for new `perfection` tier
- **TMDB v3 API** with v4 Bearer token (never `?api_key=`)
- **Groq SDK** with `llama-3.3-70b-versatile`
- **Tailwind CSS** with custom design tokens

## Environment Variables

Required (already set in Vercel — names match exactly):

```env
GROQ_API_KEY=
GOOGLE_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
NEXTAUTH_URL=https://cinetales-lilac.vercel.app
NEXTAUTH_SECRET=
DATABASE_URL=
TMDB_BEARER_TOKEN=
```

`TMDB_BEARER_TOKEN` is the v4 read-access token, used as `Authorization: Bearer …`.

`DATABASE_URL` is your Postgres connection string. Tables auto-create on first call to `/api/watchlist` or `/api/ratings`. The `vibe` CHECK constraint is **safely migrated** to allow `'perfection'` without dropping data.

## Local Development

```bash
npm install
cp .env.example .env.local   # fill in values
npm run dev                  # http://localhost:3000
```

For local Google OAuth, set `NEXTAUTH_URL=http://localhost:3000` and add `http://localhost:3000/api/auth/callback/google` to your Google OAuth client's authorized redirect URIs.

## Deploy

Just push. Vercel rebuilds. Existing env vars work as-is.

## Project Structure

```
cinetales/
├── pages/
│   ├── _app.js, _document.js
│   ├── index.js          ← Hero with scrolling poster walls
│   ├── login.js, search.js, discover.js, trending.js
│   ├── vibes.js          ← AI mood-based recs
│   ├── match.js          ← AI Match flagship (NEW)
│   ├── profile.js, watchlist.js, about.js
│   ├── movie/[id].js, tv/[id].js
│   └── api/
│       ├── auth/[...nextauth].js
│       ├── search.js, discover.js
│       ├── vibes.js
│       ├── ai-match.js   ← NEW
│       ├── ai-pitch.js   ← NEW
│       └── watchlist.js, ratings.js
├── components/
│   ├── Navbar, Footer, MovieCard, HorizontalScrollRow
│   ├── TrailerHero, TrailerModal, WatchProviders
│   ├── RatingPanel, RatingControls (4 tiers), RatingBadge
│   ├── WatchlistButton, SearchBar, GenreTag
│   ├── AIPitch          ← NEW
│   └── SkeletonCard, LoadingSpinner, Marquee, Typewriter
├── lib/
│   ├── tmdb.js          ← Bearer auth, all TMDB endpoints + helpers
│   ├── db.js            ← pg pool, idempotent migrations
│   └── auth.js
├── styles/globals.css
├── public/favicon.svg
└── README.md
```

## Credits

Designed and built by [Ayush](https://github.com/ayushme1234). Movie & TV data from [TMDB](https://www.themoviedb.org/). Streaming availability via JustWatch (through TMDB). AI by [Groq](https://groq.com). This product uses the TMDB API but is not endorsed or certified by TMDB.
