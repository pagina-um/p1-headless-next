import { NextResponse } from "next/server";
import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import {
  MAX_MEDIA_BYTES,
  postTweet,
  twitterConfigured,
  uploadMedia,
} from "@/services/twitter";
import { verifyAdminToken } from "@/services/admin-token";
import { extractPostImages } from "@/utils/postImages";
import {
  MAIN_MAX_CHARS,
  REPLY_MAX_CHARS,
  SITE_ORIGIN,
} from "@/constants/xPromo";

export const maxDuration = 60;

const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

/**
 * Admin-only: publish the reviewed post to the @PAG_UM X account. The main
 * post carries the text and the chosen picture; the article URL goes in a
 * first reply so X's external-link penalty doesn't suppress the post itself.
 */
export async function POST(req: Request) {
  if (!verifyAdminToken(req.headers.get("x-admin-token"))) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  if (!twitterConfigured()) {
    return NextResponse.json(
      { error: "as chaves do X não estão configuradas (X_API_KEY…)" },
      { status: 503 }
    );
  }

  const { postId, text, replyText, imageUrl } = (await req
    .json()
    .catch(() => ({}))) as {
    postId?: number | string;
    text?: string;
    replyText?: string;
    imageUrl?: string | null;
  };

  if (!postId || !text?.trim()) {
    return NextResponse.json(
      { error: "postId ou texto em falta" },
      { status: 400 }
    );
  }
  if (text.trim().length > MAIN_MAX_CHARS) {
    return NextResponse.json(
      { error: `o texto excede ${MAIN_MAX_CHARS} caracteres` },
      { status: 400 }
    );
  }
  if ((replyText ?? "").trim().length > REPLY_MAX_CHARS) {
    return NextResponse.json(
      { error: `a resposta excede ${REPLY_MAX_CHARS} caracteres` },
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

  // Only publish a picture that actually belongs to this story — the client
  // sends back a URL, and nothing else stops it being an arbitrary one.
  let media: { url: string } | null = null;
  if (imageUrl) {
    const images = extractPostImages(post.content, post.featuredImage?.node);
    const match = images.find((image) => image.url === imageUrl);
    if (!match) {
      return NextResponse.json(
        { error: "a imagem escolhida não pertence a esta peça" },
        { status: 400 }
      );
    }
    media = { url: match.url };
  }

  try {
    let mediaId: string | undefined;
    if (media) {
      const [buffer, contentType] = await fetchImage(media.url);
      mediaId = await uploadMedia(buffer, contentType);
    }
    const tweet = await postTweet(text.trim(), { mediaId });

    // Link in the first reply. A reply failure must not fail the request — the
    // main post is already live; report it so the editor can reply by hand.
    const url = `${SITE_ORIGIN}${post.uri ?? `/${post.slug}`}`;
    const reply = `${(replyText ?? "").trim()} ${url}`.trim();
    let replyFailed = false;
    await postTweet(reply, { replyTo: tweet.id }).catch((e) => {
      console.error("[x-promo] link reply failed", e);
      replyFailed = true;
    });

    return NextResponse.json({ ...tweet, replyFailed, replyUrl: url });
  } catch (e) {
    console.error("[x-promo] tweet failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "publicação falhou" },
      { status: 502 }
    );
  }
}

/** Download a WordPress image and hand it to the X upload as (buffer, type). */
async function fetchImage(url: string): Promise<[Buffer, string]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`não foi possível descarregar a imagem (${res.status})`);
  }
  const contentType = (res.headers.get("content-type") ?? "")
    .split(";")[0]
    .trim()
    .toLowerCase();
  if (!ALLOWED_MEDIA_TYPES.includes(contentType)) {
    throw new Error(`formato de imagem não suportado pelo X (${contentType || "desconhecido"})`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_MEDIA_BYTES) {
    throw new Error(
      `a imagem tem ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB — o X aceita no máximo 5 MB`
    );
  }
  return [buffer, contentType];
}
