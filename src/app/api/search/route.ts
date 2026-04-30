import { NextResponse } from "next/server";
import { tmdbApi } from "@/lib/tmdb";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: [] });

  try {
    const data = await tmdbApi.search(q);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ results: [], error: "TMDB error" }, { status: 500 });
  }
}
