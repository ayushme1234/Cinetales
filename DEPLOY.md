# 🚀 CineTales Deployment Guide

Get your CineTales site live on the internet for **free**. Total time: **~45 minutes**.

---

## What you need (install once)

| Tool | Purpose | Get it from |
|------|---------|-------------|
| **Node.js** (v20+) | Runs the project | https://nodejs.org (click green LTS button) |
| **Git** | Pushes code to GitHub | https://git-scm.com |
| **VS Code** (optional) | Edit the `.env.local` file | https://code.visualstudio.com |

Verify Node is installed: open Terminal/Command Prompt and run `node --version` → should print `v20.x.x`.

---

## STEP 1 — Install the project (3 min)

1. **Unzip** `cinetales.zip` somewhere easy like `Documents/cinetales`
2. Open Terminal/Command Prompt **inside that folder**:
   - **Mac:** open Terminal → type `cd ` (with space) → drag the folder into the window → press Enter
   - **Windows:** open the folder in File Explorer → click the address bar → type `cmd` → press Enter
3. Install:
   ```
   npm install
   ```
   *(2-5 min depending on your internet)*

---

## STEP 2 — Get 6 free API keys (20 min)

Open a notepad. As you collect each value, paste it here:

```
DATABASE_URL = ____________________
NEXTAUTH_SECRET = ____________________
GOOGLE_CLIENT_ID = ____________________
GOOGLE_CLIENT_SECRET = ____________________
TMDB_BEARER_TOKEN = ____________________
GROQ_API_KEY = ____________________
```

### 🎬 1. TMDB Bearer Token

1. Go to https://www.themoviedb.org/signup → sign up → verify email
2. Click your profile picture (top right) → **Settings** → **API** (left sidebar)
3. Click **Request an API Key** → choose **Developer**
4. Fill the form:
   - Application Name: `CineTales`
   - Application URL: `https://localhost:3000`
   - Application Summary: *Personal movie discovery app for educational purposes only.*
   - Type of Use: **Website**
   - Use any name + address (TMDB doesn't verify these)
5. Submit → approval is **instant**
6. Copy the **API Read Access Token** (the long JWT starting with `eyJ`)

### 🔐 2 & 3. Google Client ID + Secret

1. Go to https://console.cloud.google.com → sign in
2. Top → click project dropdown → **NEW PROJECT** → name `CineTales` → **CREATE** → wait 30s
3. Make sure CineTales is selected
4. Left sidebar → **APIs & Services** → **OAuth consent screen**
5. Choose **External** → **CREATE**
6. Fill app name `CineTales`, support email, developer contact email → **SAVE AND CONTINUE** through every step
7. Left sidebar → **APIs & Services** → **Credentials**
8. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
9. Type: **Web application**, Name: `CineTales Web Client`
10. Under **Authorized JavaScript origins**, click **+ ADD URI** → paste:
    ```
    http://localhost:3000
    ```
11. Under **Authorized redirect URIs**, click **+ ADD URI** → paste:
    ```
    http://localhost:3000/api/auth/callback/google
    ```
12. Click **CREATE** → popup shows **Client ID** + **Client Secret** → copy both
13. **Keep this Google Console tab open** — you'll add prod URLs later

### 🗄️ 4. Database URL (Supabase)

1. Go to https://supabase.com → **Start your project** → sign in with GitHub
2. **New Project**:
   - Name: `cinetales`
   - Database password: click **Generate** → **COPY THE PASSWORD** (save it!)
   - Region: closest to India (e.g. Singapore or Mumbai)
   - Plan: Free
3. Click **Create new project** → wait 2 min
4. Click **Settings** (gear icon, bottom-left) → **Database**
5. Scroll to **"Connection pooling"** section *(NOT the regular Connection string)*
6. Mode: **Transaction** (default)
7. Copy the connection string. It looks like:
   ```
   postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
   ```
8. **Replace `[YOUR-PASSWORD]`** with the password you saved in step 2

> ⚠️ **CRITICAL:** Use the pooling URL with port `6543`, NOT the direct one with port `5432`. The direct one will fail on Vercel.

### 🤖 5. Groq API Key

1. Go to https://console.groq.com/keys
2. Sign in with Google or email
3. Click **+ Create API Key** → name it `CineTales`
4. **Copy the key immediately** (starts with `gsk_`) — you can't see it again after closing the popup

### 🔑 6. NextAuth Secret

Just visit https://generate-secret.vercel.app/32 and copy what's shown.

✅ All 6 values collected.

---

## STEP 3 — Test it on your computer (5 min)

This is **optional but strongly recommended** — catches any issue before deploying.

1. In your `cinetales` folder, copy the env template:
   - **Mac:** `cp .env.example .env.local`
   - **Windows:** `copy .env.example .env.local`
2. Open `.env.local` in VS Code (or any text editor):
   ```
   code .env.local
   ```
3. Replace each `PASTE_..._HERE` with your real value from your notepad. Keep the quotes.
4. Save the file
5. Create the database tables:
   ```
   npm run db:push
   ```
   You'll see green checkmarks. ✅
6. Start the dev server:
   ```
   npm run dev
   ```
7. Open http://localhost:3000 in your browser

Test:
- ✅ Browse movies
- ✅ Click "Sign in" → sign in with Google
- ✅ Add to watchlist
- ✅ Try `/vibes` (AI mood matcher)

If it works locally, press **Ctrl+C** in terminal to stop, then continue.

---

## STEP 4 — Push to GitHub (5 min)

1. Sign up at https://github.com/signup if you don't have an account
2. Create a new repo at https://github.com/new
   - Name: `cinetales`
   - **Public** ✓
   - **DON'T** check any initialization options
   - Click **Create repository**
3. Back in terminal (in your cinetales folder):
   ```
   git init
   git add .
   git commit -m "Initial CineTales"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/cinetales.git
   git push -u origin main
   ```
   *(Replace `YOUR-USERNAME` with your real GitHub username)*

> **If Git asks for password** and your GitHub password fails: go to https://github.com/settings/tokens → **Generate new token (classic)** → check **repo** scope → **Generate** → use that token as your password.

4. Refresh your GitHub repo. You should see all files. ✅
   - `.env.local` should **NOT** be there (it's gitignored — your secrets stay private)
   - `.env.example` IS there (just the template, no secrets)

---

## STEP 5 — Deploy on Vercel (10 min)

1. Go to https://vercel.com/signup → **Continue with GitHub** (use the same GitHub account)
2. Authorize Vercel to access your repos
3. Dashboard → **Add New...** → **Project**
4. Find `cinetales` in the list → click **Import**
5. On the configure screen:
   - Framework Preset: **Next.js** (auto-detected) ✅
   - Root Directory: `./` (default)
   - Build Command: leave default *(your `vercel.json` already configures it)*
6. Scroll to **Environment Variables** — add all 6:

   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | your Supabase pooling URL |
   | `NEXTAUTH_SECRET` | your random secret |
   | `GOOGLE_CLIENT_ID` | your Google Client ID |
   | `GOOGLE_CLIENT_SECRET` | your Google Client Secret |
   | `TMDB_BEARER_TOKEN` | your TMDB JWT |
   | `GROQ_API_KEY` | your Groq key |

   For each: type Name on left, paste Value on right, click **Add**.

7. Click the big **Deploy** button → wait 1-2 min → 🎉 confetti
8. **Copy your live URL** at the top (e.g. `https://cinetales-abc.vercel.app`)

---

## STEP 6 — Add NEXTAUTH_URL + redeploy (3 min)

1. In Vercel → **Settings** → **Environment Variables**
2. Click **Add New**:
   - Name: `NEXTAUTH_URL`
   - Value: your Vercel URL (no trailing slash) — e.g. `https://cinetales-abc.vercel.app`
   - Environment: **All** (Production, Preview, Development)
3. Click **Save**
4. Go to **Deployments** tab → most recent deployment → click the **⋮** (three dots) → **Redeploy** → Confirm
5. Wait 1-2 min for the redeploy to finish

---

## STEP 7 — Update Google OAuth for production (2 min)

Right now Google only allows `localhost`. Add your live URL:

1. Go back to https://console.cloud.google.com (the tab from Step 2)
2. **APIs & Services** → **Credentials** → click your **CineTales Web Client**
3. Under **Authorized JavaScript origins**, click **+ ADD URI** and paste your Vercel URL:
   ```
   https://cinetales-abc.vercel.app
   ```
   *(use YOUR Vercel URL)*
4. Under **Authorized redirect URIs**, click **+ ADD URI** and paste:
   ```
   https://cinetales-abc.vercel.app/api/auth/callback/google
   ```
5. Click **SAVE**
6. Wait 1 minute for Google to propagate the change

---

## STEP 8 — Test your live site

Open your Vercel URL. Test everything:

- ✅ Browse trending movies on the homepage
- ✅ Click a movie poster → see the trailer thumbnail with play button
- ✅ Click "Sign in" → sign in with Google → it should work and redirect back
- ✅ Add a movie to your watchlist
- ✅ Rate a movie (give it stars)
- ✅ Drop a verdict (Go for it / Timepass / Skip it)
- ✅ Try `/vibes` — type "rainy day comfort watch" → AI returns 8 picks
- ✅ Click the **Ask AI** floating button on a movie page → ask "is it scary?"
- ✅ Visit `/about` to see your creator page
- ✅ Visit `/profile` to see your verdicts

🎉 **You're live on the internet for free.** Share your URL anywhere.

---

## How to push updates (anytime later)

When you change code:
```
git add .
git commit -m "what you changed"
git push
```

Vercel auto-detects the push and redeploys in ~90 seconds. Your live site updates automatically.

---

## Troubleshooting

### "Build failed" on Vercel
Click the failed deployment → check the build log. Most common cause: a missing environment variable. Add it in **Settings → Environment Variables** → redeploy.

### "Sign in with Google" doesn't work in production
- Did you add the **production redirect URI** to Google Console (Step 7)?
- Did you wait 1-2 min after saving in Google Console?
- Is `NEXTAUTH_URL` in Vercel set to your live URL with **no trailing slash**?

### Database errors / "Can't reach database server"
Make sure your `DATABASE_URL` uses the **pooling port `6543`**, NOT `5432`. Verify the password is filled in correctly with no spaces.

### Posters/images don't load
Your TMDB token is wrong. Verify it in Vercel → Environment Variables, edit if needed, then redeploy.

### AI features fail
- Check `GROQ_API_KEY` is set correctly in Vercel
- Free tier has rate limits (30 req/min) — wait a minute and try again
- Check usage at https://console.groq.com/usage

### Local works but production breaks
99% of the time, an env var is different in Vercel vs your local `.env.local`. Compare them side-by-side.

### My push to GitHub gets rejected
Run `git pull --rebase origin main` first, then `git push`.

---

## Free-tier limits (you won't exceed)

| Service | Limit | Will you hit it? |
|---------|-------|------------------|
| Vercel Hobby | 100 GB bandwidth/month | No (need ~10K visitors) |
| Supabase | 500 MB DB, 50K MAUs | No (you'd need real traction) |
| TMDB | Unlimited (non-commercial) | No |
| Google OAuth | Unlimited | No |
| Groq | 14,400 requests/day, 30/min | No (~480/day average use) |

**Total cost forever: ₹0/month.**

---

## Need help?

If stuck, paste:
1. **Which step number** you're on
2. **The exact error message** (screenshot or copy-paste)

I can debug it specifically.

---

Built with ❤️ by [Ayush](https://nextfolio-rouge.vercel.app/) · Kolkata, IN
