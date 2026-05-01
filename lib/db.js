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
 * Idempotent table setup. Safe to run on every API call —
 * uses CREATE TABLE IF NOT EXISTS and migrates the vibe CHECK
 * constraint to support the new 4-tier system without data loss.
 */
export async function ensureTables() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const pool = getPool();

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

    // Migration — add title / poster_path to existing ratings table if missing.
    await pool.query(`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS title TEXT`);
    await pool.query(`ALTER TABLE ratings ADD COLUMN IF NOT EXISTS poster_path TEXT`);

    // Migrate vibe CHECK constraint — drop old one, add new one with 'perfection'.
    // Safe to run repeatedly.
    await pool.query(`
      DO $$
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
        -- swallow; constraint may already be in place
        NULL;
      END $$;
    `);
  })();
  return _initPromise;
}
