# Cloudflare in front of the WordPress backend

Status: **decided, cutover pending** (Sep 2026). The operational runbook with
step-by-step commands lives outside this repo (ask on tech@).

## Architecture decision — hybrid, not a migration

- **Cloudflare becomes authoritative DNS** for `paginaum.pt`.
- **`backend.paginaum.pt` (headless WordPress) is proxied and hardened**:
  SSL Full (strict) with an Origin CA cert, origin firewall allowing only
  Cloudflare IPs, managed WAF rulesets, `xmlrpc.php` blocked, rate limits on
  `/graphql`, `/wp-json/*` and `/wp-login.php`, and Cloudflare Access in front
  of `/wp-login.php` + `/wp-admin`.
- **The Next.js front end stays on Vercel, DNS-only** (`@`, `www`, `lp`).
  Vercel's KB explicitly discourages a reverse proxy in front of its edge
  (firewall visibility, double challenges, cache management), and our CDN
  usage fits inside Vercel's included quotas. Re-evaluate only if bot
  handling or egress costs change the math.
- Mail records (`MX`, SPF/DKIM/DMARC, `mail`, `webmail`) are never proxied.

## What the app code must know

- Server-side GraphQL calls (`src/services/wp-graphql.ts`, `fetchOptions`) and
  the feed proxy (`src/app/feed/route.ts`) must send a shared-secret header on
  requests to the backend. Cloudflare skip rules key on it so our own SSR is
  never challenged or rate-limited. The value comes from a **server-only** env
  var in Vercel (never `NEXT_PUBLIC_*`); Vercel egress IPs rotate, which is why
  a header beats an IP allowlist.
- `NEXT_PUBLIC_WP_URL` in production must be `https://backend.paginaum.pt/`.
  Pointing it at the raw origin hostname bypasses the proxy and will stop
  working once the origin firewall is on.
- WordPress → Vercel webhooks (`/api/revalidate`, `/api/purge-homepage`) are
  outbound from the backend and unaffected.
- `next/image` stays on Vercel image optimization — do not add a Cloudflare
  image loader.

## Planned follow-ups (separate from the cutover)

1. Move TTS audio from Vercel Blob to Cloudflare R2 behind
   `audio.paginaum.pt` (zero-egress; change is contained in
   `src/app/api/tts/generate/route.ts` plus a backlog copy).
2. Investigate ISR write volume (`/api/revalidate`, `/api/purge-homepage`
   revalidate far more than traffic justifies).
3. Cloudflare Tunnel on the backend host (no open inbound ports, SSH via
   Access).
4. Tighten DMARC from `p=none` once SPF/DKIM are verified stable after the
   DNS move.
