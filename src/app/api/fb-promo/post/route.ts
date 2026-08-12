import { NextResponse } from "next/server";
import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { facebookConfigured, postToPage } from "@/services/facebook";
import { verifyAdminToken } from "@/services/admin-token";
import { FB_MAIN_MAX_CHARS } from "@/constants/fbPromo";
import { SITE_ORIGIN } from "@/constants/xPromo";

export const maxDuration = 60;

/**
 * Admin-only: publish the reviewed post to the PÁGINA UM Facebook Page as a
 * link post — the text plus the article URL, which Facebook renders as a
 * clickable preview card. The URL is rebuilt server-side from the WordPress
 * post, so the client never chooses where the link points.
 */
export async function POST(req: Request) {
  if (!verifyAdminToken(req.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  if (!facebookConfigured()) {
    return NextResponse.json(
      { error: "as chaves do Facebook não estão configuradas (FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN)" },
      { status: 503 }
    );
  }

  const { postId, text } = (await req.json().catch(() => ({}))) as {
    postId?: number | string;
    text?: string;
  };

  if (!postId || !text?.trim()) {
    return NextResponse.json(
      { error: "postId ou texto em falta" },
      { status: 400 }
    );
  }
  if (text.trim().length > FB_MAIN_MAX_CHARS) {
    return NextResponse.json(
      { error: `o texto excede ${FB_MAIN_MAX_CHARS} caracteres` },
      { status: 400 }
    );
  }

  const { data, error } = await getClient()
    .query(GET_POST_BY_ID, { id: String(postId) })
    .toPromise();
  const post = data?.post;
  if (error || !post) {
    return NextResponse.json(
      { error: "não foi possível carregar a peça no WordPress" },
      { status: error ? 502 : 404 }
    );
  }

  try {
    const linkUrl = `${SITE_ORIGIN}${post.uri ?? `/${post.slug}`}`;
    const result = await postToPage(text.trim(), linkUrl);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[fb-promo] post failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "publicação falhou" },
      { status: 502 }
    );
  }
}
