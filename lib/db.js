import { Pool } from "pg";

let _pool = null;
let _initPromise = null;

export function getPool() {
  if (!_pool) {
    _pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 30_000,
    });
  }
  return _pool;
}

/**
 * Idempotent schema setup. Each statement is wrapped in its own try-catch
 * so a single migration failure cannot poison the whole init. The cached
 * promise is reset on rejection so subsequent API calls can retry.
 */
export async function ensureTables() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const pool = getPool();

    // Helper — run a query but never throw
    async function safe(label, sql) {
      try {
        await pool.query(sql);
      } catch (e) {
        console.error(`[db migration] ${label}:`, e.message);
        // do not rethrow — keep going
      }
    }

    // Core tables — these MUST succeed. If they don't, throw so caller knows.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS watchlist (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        media_id INTEGER NOT NULL,
        media_type TEXT NOT NULL,
        title TEXT,
        poster_path TEXT,
        added_at TIMESTAMPTZ DEFAULT NOW(),
        watched BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, media_id, media_type)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        media_id INTEGER NOT NULL,
        media_type TEXT NOT NULL,
        score NUMERIC(3,1),
        vibe TEXT,
        title TEXT,
        poster_path TEXT,
        rated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, media_id, media_type)
      )
    `);

    // Optional migrations — never block other operations if they fail.
    await safe(
      "watchlist add title",
      `ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS title TEXT`
    );
    await safe(
      "watchlist add poster_path",
      `ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS poster_path TEXT`
    );
    await safe(
      "watchlist add watched",
      `ALTER TABLE watchlist ADD COLUMN IF NOT EXISTS watched BOOLEAN DEFAULT FALSE`
    );
    await safe(
      "ratings add title",
      `ALTER TABLE ratings ADD COLUMN IF NOT EXISTS title TEXT`
    );
    await safe(
      "ratings add poster_path",
      `ALTER TABLE ratings ADD COLUMN IF NOT EXISTS poster_path TEXT`
    );

    // Vibe constraint — also non-blocking. The app code only ever writes valid
    // values, so even if the constraint can't be added, inserts still work.
    await safe(
      "ratings vibe check constraint",
      `DO $$
       BEGIN
         IF EXISTS (
           SELECT 1 FROM pg_constraint
           WHERE conname = 'ratings_vibe_check'
         ) THEN
           ALTER TABLE ratings DROP CONSTRAINT ratings_vibe_check;
         END IF;
         ALTER TABLE ratings
           ADD CONSTRAINT ratings_vibe_check
           CHECK (vibe IS NULL OR vibe IN ('skip','mid','go','perfection'));
       EXCEPTION WHEN others THEN
         NULL;
       END $$;`
    );
  })();

  // If init fails, reset the cache so the NEXT call can retry. Without this,
  // every API call would forever return the same rejected promise and 500.
  _initPromise.catch(() => {
    _initPromise = null;
  });

  return _initPromise;
}
