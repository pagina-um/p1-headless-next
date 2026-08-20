import { NextResponse } from "next/server";
import { SITE_ORIGIN } from "@/constants/xPromo";

export const revalidate = 300;

export async function GET() {
  const wpUrl = process.env.NEXT_PUBLIC_WP_URL;
  if (!wpUrl) {
    return new NextResponse("Feed unavailable", { status: 500 });
  }

  const wpOrigin = new URL(wpUrl).origin;
  const res = await fetch(`${wpOrigin}/feed/`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    return new NextResponse("Feed unavailable", { status: 502 });
  }

  // WordPress stamps backend hosts into every link in the feed — the current
  // one via permalinks, older ones via guids stored at publish time. Media
  // must map to /media/* (proxied to wp-content/uploads); everything else
  // maps straight to the public origin.
  const backendHosts = Array.from(
    new Set([
      new URL(wpOrigin).host,
      "srv700518.hstgr.cloud",
      "backend.paginaum.pt",
    ])
  );
  let xml = await res.text();
  for (const host of backendHosts) {
    const hostPattern = host.replace(/\./g, "\\.");
    xml = xml
      .replace(
        new RegExp(`https?://${hostPattern}/wp-content/uploads/`, "g"),
        `${SITE_ORIGIN}/media/`
      )
      .replace(new RegExp(`https?://${hostPattern}`, "g"), SITE_ORIGIN);
  }

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=UTF-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
