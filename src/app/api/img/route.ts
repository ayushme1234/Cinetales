import { NextResponse } from "next/server";

/**
 * Proxies images from image.tmdb.org through this app.
 * Why: some Indian ISPs (Jio, Airtel, ACT, BSNL) intermittently block
 * image.tmdb.org at the DNS/SNI level. Our Vercel server isn't blocked, so we
 * fetch the image server-side and stream it back to the user.
 *
 * Usage: /api/img?path=/abc123.jpg&size=w500
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const path = url.searchParams.get("path");
  const size = url.searchParams.get("size") || "w500";

  if (!path || !path.startsWith("/")) {
    return new NextResponse("Bad path", { status: 400 });
  }

  // Allowlist sizes to prevent abuse
  const VALID_SIZES = new Set([
    "w92", "w154", "w185", "w342", "w500", "w780", "w1280", "original",
  ]);
  if (!VALID_SIZES.has(size)) {
    return new NextResponse("Bad size", { status: 400 });
  }

  const target = `https://image.tmdb.org/t/p/${size}${path}`;

  try {
    const res = await fetch(target, {
      // Cache aggressively at the CDN — these images never change
      next: { revalidate: 60 * 60 * 24 * 30 }, // 30 days
    });

    if (!res.ok) {
      return new NextResponse("Upstream error", { status: res.status });
    }

    const buf = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "image/jpeg";

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=2592000, immutable",
      },
    });
  } catch (e) {
    console.error("Image proxy failed:", e);
    return new NextResponse("Fetch failed", { status: 502 });
  }
}
