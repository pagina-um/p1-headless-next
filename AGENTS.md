# AGENTS.md

Guidance for anyone, human or model, working in this repository. Read it
before changing anything. The documents it points to are the source of truth
when they go into more detail.

## What this is

The public website of **Página UM** (paginaum.pt), an independent Portuguese
newspaper. It is a Next.js 15 App Router app deployed on Vercel. Articles come
from a headless WordPress over GraphQL; the homepage is a grid of blocks edited
in `/admin` and stored in Redis. See `README.MD` for setup and `docs/` for the
rest.

## Language and spelling

- All reader-facing text is **European Portuguese in the pre-1990 spelling**
  (the convention Página UM writes in): *projecto*, *actual*, *direcção*,
  *facto*, *óptimo*, *acção*. Not *projeto*, *atual*, *direção*. Code
  identifiers and URLs follow the same spelling where they carry a Portuguese
  word (`/projectos`, `ProjectoShell`).
- Code, comments and commit messages are in English.

## Where things live

| Area | Path |
| --- | --- |
| Pages (routes) | `src/app/` — a folder with `page.tsx` is a public URL |
| Article pages, built from WordPress | `src/app/[yearOrSlug]/[month]/[day]/[slug]/` |
| Homepage grid and its blocks | `src/components/grid/`, `src/components/blocks/`, `src/constants/blocks.ts` |
| Site header, nav, banner | `src/components/layout/` |
| Special projects (archives, datasets) | `src/app/projectos/<slug>/`, registry in `src/projectos/registry.ts` |
| Interactive stories (infografias) shown inside articles | `src/app/infografias/<slug>/`, registry in `src/infografias/registry.ts` |
| WordPress HTML to React, including the infografia marker | `src/utils/wpParsing.ts` |
| Promo banner and homepage block choice | `src/config/destaques.ts` |
| WordPress GraphQL client and queries | `src/services/wp-graphql.ts` |
| Global CSS and fonts | `src/styles/globals.css`, `tailwind.config.js` |
| Design language | `docs/design.md` |
| Contributing a special project | `docs/projectos/README.md` |
| Contributing an infografia | `docs/infografias/README.md` |

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # types
npm run lint
npm run build        # must pass before any PR
```

`npm run dev` reads `.env.local`. Without a WordPress URL the homepage and
articles will not load, but pages under `/projectos` and `/infografias` work.
`npm run build` does need the WordPress backend, because article pages are
prerendered from it. A contributor without that access runs `tsc` and `lint`
locally and relies on the Vercel preview of the pull request for the build.

## Rules

- Do not add dependencies without saying so in the PR.
- Do not touch `src/app/api/`, `src/middleware.ts`, `src/services/`,
  environment variables, Redis or anything WordPress-related unless that is
  the task.
- Do not edit `src/styles/globals.css` or `tailwind.config.js` for a single
  page; use Tailwind classes in the page.
- Everything that renders is a route or a component: TypeScript, React and
  Tailwind, with data in JSON files next to the page. Never a hand-written
  HTML, CSS or JavaScript file. `public/` holds only images, fonts and files
  offered for download.
- Use `"use client"` only in the component that needs browser interactivity.
- Keep the page working at 390 px wide with no horizontal scroll.
- Never invent content, data, names or sources.

## How a news story works

Journalists write stories in WordPress; this app only renders them. There is
no story content in the repository.

1. A story is published in WordPress (`NEXT_PUBLIC_WP_URL`), with title,
   lede (`antetitulo`), featured image, categories and body.
2. WordPress calls `/api/revalidate`, which purges the story's page, the
   homepage and the category pages.
3. The page `src/app/[yearOrSlug]/[month]/[day]/[slug]/page.tsx` fetches the
   story over GraphQL (`src/services/wp-graphql.ts`), renders the header
   (`src/components/post/PostHeader.tsx`), the audio player if the story has
   one, the body (`PostContent.tsx`) and the share links, and caches the
   result (ISR, one day).
4. The body is WordPress HTML. `src/utils/wpParsing.ts` turns it into React:
   images become `next/image`, links to the old host are rewritten, external
   links open in a new tab, video and audio iframes get a responsive size,
   and the infografia marker becomes the registered component.
5. The homepage shows the story only when an editor places it on the grid in
   `/admin`.

A story is therefore edited in WordPress, never by pull request. What a pull
request can change is how stories are rendered: the article components, the
parser, and the pieces that stories can include.

## Kinds of contribution

- A **normal story** needs nothing from this repository. If a story needs
  something the renderer cannot do yet (a new kind of block, a different
  header, a layout), that is a change to the article components or the
  parser, in `src/components/post/` and `src/utils/wpParsing.ts`, made once
  for every story, never for one story. Contract: `docs/noticias/README.md`.

- A **special project** is a section of its own (an archive, an observatory,
  a searchable dataset), listed at `/projectos`. Contract:
  `docs/projectos/README.md`.
- An **infografia** is an interactive piece that belongs to one news story:
  a map, a timeline, an explorable table. It is a React component registered
  in `src/infografias/registry.ts`; the article shows it inline where the
  editor placed `<div data-infografia="<slug>"></div>` in a Custom HTML
  block, and it also has a page of its own at `/infografias/<slug>`. A story
  can be mostly or entirely an infografia: the WordPress article then holds
  the title, the lede and the marker, and the piece is the story.
  Contract: `docs/infografias/README.md`.

All three are built the same way: TypeScript, React, Tailwind, data in JSON. The difference is where the result shows up.

## How changes get in

Branch protection requires every change to `main` to come through a pull
request, which a maintainer reviews and merges. Nobody pushes to `main`.

1. With write access to `pagina-um/p1-headless-next` (ask a maintainer),
   branch directly in the repository. Without it, fork and branch in the
   fork; Vercel then asks a maintainer to authorise the preview build.
2. Start from an up-to-date `main`. Branch names: `projecto/<slug>` for a
   special project, `infografia/<slug>` for an infografia, `fix/<what>` or
   `feature/<what>` otherwise.
3. Run types, lint and build. All three must pass.
4. Open the PR against `main`, with a description that says what it is, how
   it was verified and what was left out. Vercel builds a preview for every
   PR from a branch in the repository.

`CONTRIBUTING.md` has the git commands for each step. After the merge, Vercel
deploys `main` on its own.
