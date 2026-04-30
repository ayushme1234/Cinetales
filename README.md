# 🎬 CineTales

Movie & show discovery app with AI. Free to deploy. Built by [Ayush](https://nextfolio-rouge.vercel.app/).

```
🎥 Trailer playback   ⭐ 0-10 ratings + Go/Timepass/Skip verdicts
🤖 AI Vibes matcher   💬 AI chat about any title
🔍 Filters (genre/year/rating)   🔐 Google sign-in
🇮🇳 India ISP-block workaround   📊 Community stats
```

---

## 🚀 Deploy in 45 minutes for free

**👉 Follow [DEPLOY.md](./DEPLOY.md) — complete step-by-step guide.**

It walks you through 8 steps:
1. Install the project
2. Get 6 free API keys (TMDB, Google OAuth, Supabase, Groq, NextAuth)
3. Test it locally
4. Push to GitHub
5. Deploy to Vercel
6. Add the production URL env var
7. Update Google OAuth for production
8. Test the live site

---

## Tech stack

Next.js 14 · TypeScript · Tailwind · NextAuth · Prisma · PostgreSQL · TMDB API · Groq + Llama 3.3 70B

## Free-tier costs

Hosted entirely on free tiers (Vercel + Supabase + Groq + TMDB + Google OAuth). **Total: ₹0/month.**

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in 6 values (see DEPLOY.md)
npm run db:push              # create database tables
npm run dev                  # → http://localhost:3000
```

## Useful scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Run dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build locally |
| `npm run lint` | Lint code |
| `npm run db:push` | Sync schema to database |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run db:generate` | Regenerate Prisma client |

## Project structure

```
src/
  app/                    Pages (Next.js App Router)
    page.tsx              Landing page
    about/                About the creator
    discover/             Browse with filters
    movie/[id]/           Film details (trailer + AI + comments)
    tv/[id]/              Show details
    vibes/                AI mood matcher 🆕
    login/, profile/, watchlist/, search/, trending/
    api/
      auth/[...nextauth]/ NextAuth handler
      ai/                 AI routes (recommend, mood, chat)
      img/                TMDB image proxy (India workaround)
      review/, watchlist/, comments/, search/
  components/             React components
  lib/
    auth.ts               NextAuth config
    prisma.ts             Prisma client singleton
    tmdb.ts               TMDB client
    groq.ts               Groq + Llama client
prisma/
  schema.prisma           Database schema
public/                   Static assets (favicon, robots.txt)
```

---

## Credits

- Movie data: [TMDB](https://www.themoviedb.org/)
- AI: [Groq](https://groq.com/) (Llama 3.3 70B)
- Trailers: YouTube embeds

This product uses the TMDB API but is not endorsed or certified by TMDB.

## License

MIT — see [LICENSE](./LICENSE)
