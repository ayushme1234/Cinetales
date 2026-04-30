import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST: add or update the current user's text on their existing review.
// (The verdict must already exist — set via /api/review.)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { tmdbId, mediaType, title, poster, text } = body || {};
  if (!tmdbId || !mediaType || !title || !text) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (typeof text !== "string" || text.length > 1000) {
    return NextResponse.json({ error: "Comment too long" }, { status: 400 });
  }

  const existing = await prisma.review.findUnique({
    where: { userId_tmdbId_mediaType: { userId, tmdbId: Number(tmdbId), mediaType } },
  });

  if (!existing) {
    return NextResponse.json(
      { error: "Pick a verdict first (Go for it / Timepass / Skip it)" },
      { status: 400 }
    );
  }

  const updated = await prisma.review.update({
    where: { id: existing.id },
    data: { text, title, poster: poster || existing.poster },
  });

  return NextResponse.json({ ok: true, review: updated });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // Only delete the comment text, keep the verdict
  const existing = await prisma.review.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.review.update({
    where: { id },
    data: { text: null },
  });

  return NextResponse.json({ ok: true });
}

// PATCH: like a comment (increment counter)
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.review.update({
    where: { id },
    data: { likes: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
