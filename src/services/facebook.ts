// Minimal Facebook Graph API client for the PÁGINA UM Page. Uses a
// long-lived Page access token, so publishing needs no interactive OAuth
// flow — same static-credentials model as the X client.
//
// Env: FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN.

const GRAPH_ORIGIN = "https://graph.facebook.com/v25.0";

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} não está configurado`);
  return v;
}

export function facebookConfigured(): boolean {
  return Boolean(process.env.FB_PAGE_ID && process.env.FB_PAGE_ACCESS_TOKEN);
}

/**
 * Publish a link post to the Page: the text plus the article URL, which
 * Facebook renders as a clickable preview card using the article's Open Graph
 * tags (image included). Unlike X, links carry no reach penalty here, so the
 * link belongs in the post itself.
 */
export async function postToPage(
  message: string,
  link: string
): Promise<{ id: string; url: string }> {
  const res = await fetch(`${GRAPH_ORIGIN}/${env("FB_PAGE_ID")}/feed`, {
    method: "POST",
    headers: {
      // Bearer header rather than the access_token param — keeps the token
      // out of URLs and request-body logs.
      Authorization: `Bearer ${env("FB_PAGE_ACCESS_TOKEN")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, link }),
  });

  if (!res.ok) {
    throw new Error(
      `publicação no Facebook falhou (${res.status}): ${await graphError(res)}`
    );
  }

  const json = (await res.json()) as { id?: string };
  if (!json.id) throw new Error("o Facebook não devolveu o id da publicação");
  // The id comes back as {page-id}_{post-id}; facebook.com resolves it as-is.
  return { id: json.id, url: `https://www.facebook.com/${json.id}` };
}

/** Graph errors arrive as { error: { message, code } } — surface the message. */
async function graphError(res: Response): Promise<string> {
  const body = await res.text();
  try {
    const parsed = JSON.parse(body) as {
      error?: { message?: string; code?: number };
    };
    if (parsed.error?.message) {
      return `${parsed.error.message}${
        parsed.error.code ? ` (código ${parsed.error.code})` : ""
      }`;
    }
  } catch {
    // not JSON — fall through to the raw body
  }
  return body.slice(0, 200);
}
