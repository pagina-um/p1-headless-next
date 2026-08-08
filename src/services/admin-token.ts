import { createHmac, timingSafeEqual } from "node:crypto";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "./config";

/**
 * Short-lived token that lets the admin UI call the X promotion API routes.
 *
 * The /admin pages sit behind basic auth in the middleware, but /api does not —
 * and the browser will not hand basic-auth credentials to a fetch() we control.
 * So the (server-rendered, already authenticated) page mints a signed token and
 * passes it to the client component, which sends it back on every write. The
 * routes publish to the @PAG_UM account, so they must not be callable by
 * anyone who happens to find the URL.
 */

const TTL_MS = 8 * 60 * 60 * 1000; // one editing session

function secret(): string {
  const s = `${ADMIN_USERNAME ?? ""}:${ADMIN_PASSWORD ?? ""}`;
  if (s === ":") {
    // No credentials configured — only tolerable outside production, where the
    // middleware does not enforce basic auth either.
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_USERNAME/ADMIN_PASSWORD não estão configurados");
    }
    return "dev-only-secret";
  }
  return s;
}

function sign(expiresAt: number): string {
  return createHmac("sha256", secret())
    .update(String(expiresAt))
    .digest("base64url");
}

export function mintAdminToken(): string {
  const expiresAt = Date.now() + TTL_MS;
  return `${expiresAt}.${sign(expiresAt)}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [rawExpiry, signature] = token.split(".");
  const expiresAt = Number(rawExpiry);
  if (!signature || !Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }
  const expected = Buffer.from(sign(expiresAt));
  const received = Buffer.from(signature);
  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}
