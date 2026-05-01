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
      const { mediaId, mediaType } = req.query;
      if (mediaId && mediaType) {
        const { rows } = await pool.query(
          "SELECT * FROM ratings WHERE user_id=$1 AND media_id=$2 AND media_type=$3",
          [userId, mediaId, mediaType]
        );
        return res.status(200).json(rows[0] || null);
      }
      const { rows } = await pool.query(
        "SELECT * FROM ratings WHERE user_id=$1 ORDER BY rated_at DESC",
        [userId]
      );
      return res.status(200).json(rows);
    }

    if (req.method === "POST") {
      const { mediaId, mediaType, score, vibe, title, posterPath } = req.body;
      if (!mediaId || !mediaType) return res.status(400).json({ error: "Missing fields" });
      await pool.query(
        `INSERT INTO ratings (user_id, media_id, media_type, score, vibe, title, poster_path)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (user_id, media_id, media_type)
         DO UPDATE SET
           score = $4,
           vibe = $5,
           title = COALESCE(EXCLUDED.title, ratings.title),
           poster_path = COALESCE(EXCLUDED.poster_path, ratings.poster_path),
           rated_at = NOW()`,
        [userId, mediaId, mediaType, score ?? null, vibe ?? null, title || null, posterPath || null]
      );
      return res.status(200).json({ success: true });
    }

    if (req.method === "DELETE") {
      const { mediaId, mediaType } = req.body;
      await pool.query(
        "DELETE FROM ratings WHERE user_id=$1 AND media_id=$2 AND media_type=$3",
        [userId, mediaId, mediaType]
      );
      return res.status(200).json({ success: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return res.status(405).end();
  } catch (err) {
    console.error("ratings error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
