import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { tmdbId, mediaType, title, poster } = body || {};
  if (!tmdbId || !mediaType || !title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const item = await prisma.watchlist.upsert({
    where: { userId_tmdbId_mediaType: { userId, tmdbId: Number(tmdbId), mediaType } },
    update: {},
    create: { userId, tmdbId: Number(tmdbId), mediaType, title, poster: poster || null },
  });

  return NextResponse.json({ ok: true, item });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const { tmdbId, mediaType } = body || {};
  if (!tmdbId || !mediaType) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await prisma.watchlist.deleteMany({
    where: { userId, tmdbId: Number(tmdbId), mediaType },
  });

  return NextResponse.json({ ok: true });
}
