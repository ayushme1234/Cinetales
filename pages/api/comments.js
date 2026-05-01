// /api/comments — global comments per movie/TV title.
// • GET ?mediaId=X&mediaType=movie|tv → returns all comments. If empty,
//   generates 4 AI-seeded sample comments via Groq using title + genres,
//   stores them in DB, then returns. Subsequent GETs read from DB only.
// • POST (auth required) → creates a new comment for the current user.
//
// Seeded comments use is_seed=TRUE and have user_id=NULL. They're labeled
// in the UI as "Community" so users can tell them apart from real users.

import { getServerSession } from "next-auth/next";
import Groq from "groq-sdk";
import { authOptions } from "./auth/[...nextauth]";
import { getPool, ensureTables } from "../../lib/db";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Diverse name pool for seeded comments
const SEED_NAMES = [
  "Aanya", "Rohan", "Priya", "Arjun", "Diya", "Vikram",
  "Nisha", "Karthik", "Maya", "Sai", "Tara", "Aditya",
  "Zara", "Ishaan", "Meera", "Dev",
];

function randomName(used) {
  const pool = SEED_NAMES.filter((n) => !used.has(n));
  return pool[Math.floor(Math.random() * pool.length)] || "Anonymous";
}

async function generateSeedComments({ title, year, genres }) {
  if (!process.env.GROQ_API_KEY) return [];
  try {
    const prompt = `Generate 4 short, varied movie review comments for "${title}"${year ? ` (${year})` : ""}${genres?.length ? ` — a ${genres.join("/")} film` : ""}.

Each comment is 1-2 sentences, written casually like real moviegoers chatting online.
Mix the perspectives:
- One hyped/loved it
- One thoughtful/analytical
- One mixed reaction (loved one part, didn't love another)
- One short reaction with an emoji or two

DO NOT mention spoilers. DO NOT use the title in your comments. Sound natural, conversational, slightly opinionated.

Return ONLY a JSON array with this exact shape, no markdown, no preamble:
[{"content":"..."},{"content":"..."},{"content":"..."},{"content":"..."}]`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.85,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });
    const raw = response.choices[0]?.message?.content || "";
    // Try direct parse, fallback to extracting JSON
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      const m = raw.match(/\[[\s\S]*\]/);
      if (m) parsed = JSON.parse(m[0]);
    }
    // Accept either an array or {comments:[]}
    const arr = Array.isArray(parsed) ? parsed : parsed?.comments || parsed?.result || [];
    const used = new Set();
    return arr
      .slice(0, 4)
      .map((c) => {
        const name = randomName(used);
        used.add(name);
        return {
          author_name: name,
          content: typeof c === "string" ? c : c.content,
        };
      })
      .filter((c) => c.content && c.content.length < 400);
  } catch (e) {
    console.error("seed comment gen failed:", e.message);
    return [];
  }
}

export default async function handler(req, res) {
  try {
    await ensureTables();
    const pool = getPool();

    if (req.method === "GET") {
      const mediaId = parseInt(req.query.mediaId, 10);
      const mediaType = req.query.mediaType;
      const title = req.query.title || "";
      const year = req.query.year || "";
      const genres = req.query.genres
        ? String(req.query.genres).split(",").filter(Boolean)
        : [];
      if (!mediaId || !["movie", "tv"].includes(mediaType)) {
        return res.status(400).json({ error: "Missing mediaId or mediaType" });
      }

      const existing = await pool.query(
        `SELECT id, user_id, author_name, author_picture, content,
                is_seed, created_at
         FROM comments
         WHERE media_id=$1 AND media_type=$2
         ORDER BY created_at DESC
         LIMIT 200`,
        [mediaId, mediaType]
      );

      // If empty AND we have a title, seed it
      if (existing.rows.length === 0 && title) {
        const seeds = await generateSeedComments({ title, year, genres });
        if (seeds.length > 0) {
          // Insert seeds with slightly varied timestamps (1-7 days ago)
          for (let i = 0; i < seeds.length; i++) {
            const offsetHours = Math.floor(Math.random() * 168) + 1;
            await pool.query(
              `INSERT INTO comments
                (user_id, author_name, media_id, media_type,
                 content, is_seed, created_at)
               VALUES (NULL, $1, $2, $3, $4, TRUE,
                 NOW() - ($5 || ' hours')::INTERVAL)`,
              [seeds[i].author_name, mediaId, mediaType, seeds[i].content, offsetHours]
            );
          }
          // Re-fetch
          const after = await pool.query(
            `SELECT id, user_id, author_name, author_picture, content,
                    is_seed, created_at
             FROM comments
             WHERE media_id=$1 AND media_type=$2
             ORDER BY created_at DESC
             LIMIT 200`,
            [mediaId, mediaType]
          );
          return res.status(200).json({ comments: after.rows });
        }
      }
      return res.status(200).json({ comments: existing.rows });
    }

    if (req.method === "POST") {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) return res.status(401).json({ error: "Sign in required" });

      const { mediaId, mediaType, content } = req.body || {};
      if (!mediaId || !["movie", "tv"].includes(mediaType)) {
        return res.status(400).json({ error: "Missing mediaId or mediaType" });
      }
      const text = String(content || "").trim();
      if (text.length < 1) return res.status(400).json({ error: "Empty comment" });
      if (text.length > 600) return res.status(400).json({ error: "Comment too long" });

      const userId = session.user.id || session.user.email;
      const result = await pool.query(
        `INSERT INTO comments
          (user_id, author_name, author_picture, media_id, media_type, content, is_seed)
         VALUES ($1,$2,$3,$4,$5,$6,FALSE)
         RETURNING id, user_id, author_name, author_picture, content,
                   is_seed, created_at`,
        [
          userId,
          session.user.name || "Anonymous",
          session.user.image || null,
          mediaId,
          mediaType,
          text,
        ]
      );
      return res.status(200).json({ comment: result.rows[0] });
    }

    if (req.method === "DELETE") {
      const session = await getServerSession(req, res, authOptions);
      if (!session?.user) return res.status(401).json({ error: "Sign in required" });
      const id = parseInt(req.query.id, 10);
      if (!id) return res.status(400).json({ error: "Missing id" });

      const userId = session.user.id || session.user.email;
      const result = await pool.query(
        `DELETE FROM comments WHERE id=$1 AND user_id=$2 RETURNING id`,
        [id, userId]
      );
      if (result.rowCount === 0) return res.status(404).json({ error: "Not found or not yours" });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("comments API:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
