import { NextResponse } from "next/server";

// BuySellAds sells the site's ad inventory and maintains the list of
// authorised sellers, which changes as their demand partners do. /ads.txt
// mirrors the copy they host, byte for byte, instead of a committed one that
// would go stale.
const SOURCE_URL = "https://cdn4.buysellads.net/pub/paginaum.ads.txt";

const ONE_HOUR = 3600;
const ONE_DAY = 86400;

// Rendered on request, so a build never depends on the BuySellAds CDN. The
// fetch below is still cached, in Next's data cache, and so is the response,
// at the CDN.
export const dynamic = "force-dynamic";

export async function GET() {
  // Past the hour the data cache keeps answering with the copy it has while
  // it refreshes in the background, and it only stores successful responses.
  // An outage at BuySellAds therefore leaves the last good copy in place.
  const res = await fetch(SOURCE_URL, {
    next: { revalidate: ONE_HOUR },
  }).catch(() => null);

  // Reaching this with a failure means there was no earlier copy to fall back
  // on. Keep the error out of every cache so the next request tries again.
  if (!res?.ok) {
    return new NextResponse("ads.txt unavailable", {
      status: 502,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new NextResponse(await res.text(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": `public, s-maxage=${ONE_HOUR}, stale-while-revalidate=${ONE_DAY}`,
    },
  });
}
