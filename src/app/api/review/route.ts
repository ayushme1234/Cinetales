import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID = new Set(["go-for-it", "timepass", "skip-it"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { tmdbId, mediaType, title, poster, verdict, rating, text } = body || {};

  if (!tmdbId || !mediaType || !title || !verdict) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!VALID.has(verdict)) {
    return NextResponse.json({ error: "Invalid verdict" }, { status: 400 });
  }

  let safeRating: number | null = null;
  if (rating !== undefined && rating !== null) {
    const n = Number(rating);
    if (Number.isNaN(n) || n < 0 || n > 10) {
      return NextResponse.json({ error: "Rating must be 0-10" }, { status: 400 });
    }
    safeRating = n;
  }

  const review = await prisma.review.upsert({
    where: {
      userId_tmdbId_mediaType: { userId, tmdbId: Number(tmdbId), mediaType },
    },
    create: {
      userId,
      tmdbId: Number(tmdbId),
      mediaType,
      title,
      poster: poster || null,
      verdict,
      rating: safeRating,
      text: text || null,
    },
    update: {
      verdict,
      title,
      poster: poster || null,
      ...(rating !== undefined ? { rating: safeRating } : {}),
      ...(text !== undefined ? { text } : {}),
    },
  });

  return NextResponse.json({ ok: true, review });
}
