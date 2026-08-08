import { createHmac, randomBytes } from "node:crypto";

// Minimal X (Twitter) client for the @PAG_UM publication account. Uses
// OAuth 1.0a user context (the four keys from the developer app, generated
// for the account that owns the app) — the only auth mode that covers both
// media upload and POST /2/tweets without an interactive OAuth2 flow.
//
// Env: X_API_KEY, X_API_SECRET (app), X_ACCESS_TOKEN, X_ACCESS_SECRET (account).

// Media upload moved to /2 and the v1.1 endpoint is deprecated, but which of
// the two an app can reach still depends on its access tier — so try the
// current one and fall back rather than betting on either.
const MEDIA_UPLOAD_URLS = [
  "https://api.x.com/2/media/upload",
  "https://upload.twitter.com/1.1/media/upload.json",
] as const;
const TWEET_URL = "https://api.x.com/2/tweets";

/** X rejects images above 5 MB on the media upload endpoint. */
export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} não está configurado`);
  return v;
}

export function twitterConfigured(): boolean {
  return Boolean(
    process.env.X_API_KEY &&
      process.env.X_API_SECRET &&
      process.env.X_ACCESS_TOKEN &&
      process.env.X_ACCESS_SECRET
  );
}

// RFC 3986 percent-encoding (encodeURIComponent misses !'()*)
function enc(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase()
  );
}

/**
 * OAuth 1.0a Authorization header. Both requests below carry their payload as
 * multipart or JSON, so only the oauth_* params enter the signature base
 * string (form-encoded bodies would have to be signed too — avoided on
 * purpose).
 */
function oauthHeader(method: "POST", url: string): string {
  const params: Record<string, string> = {
    oauth_consumer_key: env("X_API_KEY"),
    oauth_nonce: randomBytes(16).toString("hex"),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_token: env("X_ACCESS_TOKEN"),
    oauth_version: "1.0",
  };
  const paramString = Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}=${enc(params[k])}`)
    .join("&");
  const base = [method, enc(url), enc(paramString)].join("&");
  const key = `${enc(env("X_API_SECRET"))}&${enc(env("X_ACCESS_SECRET"))}`;
  params.oauth_signature = createHmac("sha1", key).update(base).digest("base64");

  return (
    "OAuth " +
    Object.keys(params)
      .sort()
      .map((k) => `${enc(k)}="${enc(params[k])}"`)
      .join(", ")
  );
}

export async function uploadMedia(
  image: Buffer,
  contentType: string
): Promise<string> {
  if (image.byteLength > MAX_MEDIA_BYTES) {
    throw new Error(
      `a imagem tem ${(image.byteLength / 1024 / 1024).toFixed(1)} MB — o X aceita no máximo 5 MB`
    );
  }

  const failures: string[] = [];
  for (const url of MEDIA_UPLOAD_URLS) {
    // FormData is rebuilt per attempt: the Blob is consumed by the first send.
    const form = new FormData();
    form.append("media", new Blob([new Uint8Array(image)], { type: contentType }));
    form.append("media_category", "tweet_image");

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: oauthHeader("POST", url) },
      body: form,
    });

    if (res.ok) {
      // v2 answers { data: { id } }, v1.1 answers { media_id_string }.
      const json = (await res.json()) as {
        data?: { id?: string };
        media_id_string?: string;
      };
      const mediaId = json.data?.id ?? json.media_id_string;
      if (mediaId) return mediaId;
      failures.push(`${url}: resposta sem media id`);
      continue;
    }

    const body = await res.text();
    failures.push(`${url}: ${res.status} ${body.slice(0, 200)}`);
    // 401/403 mean the keys or the app's permissions are wrong — the other
    // endpoint will answer the same, so don't paper over it with a retry.
    if (res.status === 401 || res.status === 403) break;
  }

  throw new Error(`upload de imagem falhou — ${failures.join(" | ")}`);
}

export async function postTweet(
  text: string,
  opts?: { mediaId?: string; replyTo?: string }
): Promise<{ id: string; url: string }> {
  const body: Record<string, unknown> = { text };
  if (opts?.mediaId) body.media = { media_ids: [opts.mediaId] };
  if (opts?.replyTo) body.reply = { in_reply_to_tweet_id: opts.replyTo };
  const res = await fetch(TWEET_URL, {
    method: "POST",
    headers: {
      Authorization: oauthHeader("POST", TWEET_URL),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`publicação no X falhou (${res.status}): ${await res.text()}`);
  }
  const json = (await res.json()) as { data?: { id?: string } };
  const id = json.data?.id;
  if (!id) throw new Error("o X não devolveu o id da publicação");
  return { id, url: `https://x.com/i/status/${id}` };
}
