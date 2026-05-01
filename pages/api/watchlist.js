import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { getPool, ensureTables } from "../../lib/db";

export default async function handler(req, res) {
  try {
    await ensureTables();
  } catch (err) {
    console.error("DB init failed:", err);
    return res.status(500).json({ error: "Database unavailable" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = session.user.id || session.user.email;
  const pool = getPool();

  try {
    if (req.method === "GET") {
      const { rows } = await pool.query(
        "SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC",
        [userId]
      );
      return res.status(200).json(rows);
    }
    if (req.method === "POST") {
      const { mediaId, mediaType, title, posterPath, watched } = req.body;
      if (!mediaId || !mediaType) return res.status(400).json({ error: "Missing fields" });
      await pool.query(
        `INSERT INTO watchlist (user_id, media_id, media_type, title, poster_path, watched)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (user_id, media_id, media_type)
         DO UPDATE SET
           title = COALESCE(watchlist.title, EXCLUDED.title),
           poster_path = COALESCE(watchlist.poster_path, EXCLUDED.poster_path),
           watched = CASE WHEN EXCLUDED.watched IS NOT NULL THEN EXCLUDED.watched ELSE watchlist.watched END`,
        [userId, mediaId, mediaType, title || null, posterPath || null, watched ?? null]
      );
      return res.status(200).json({ success: true });
    }
    if (req.method === "DELETE") {
      const { mediaId, mediaType } = req.body;
      await pool.query(
        "DELETE FROM watchlist WHERE user_id=$1 AND media_id=$2 AND media_type=$3",
        [userId, mediaId, mediaType]
      );
      return res.status(200).json({ success: true });
    }
    if (req.method === "PATCH") {
      const { mediaId, mediaType, watched } = req.body;
      await pool.query(
        "UPDATE watchlist SET watched=$1 WHERE user_id=$2 AND media_id=$3 AND media_type=$4",
        [!!watched, userId, mediaId, mediaType]
      );
      return res.status(200).json({ success: true });
    }
    res.setHeader("Allow", "GET, POST, DELETE, PATCH");
    return res.status(405).end();
  } catch (err) {
    console.error("watchlist error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
