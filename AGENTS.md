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
| Promo banner and homepage block choice | `src/config/destaques.ts` |
| WordPress GraphQL client and queries | `src/services/wp-graphql.ts` |
| Global CSS and fonts | `src/styles/globals.css`, `tailwind.config.js` |
| Design language | `docs/design.md` |
| Contributing a special project | `docs/projectos/README.md` |

## Commands

```bash
npm install
npm run dev          # http://localhost:3000
npx tsc --noEmit     # types
npm run lint
npm run build        # must pass before any PR
```

`npm run dev` reads `.env.local`. Without a WordPress URL the homepage and
articles will not load; special projects under `/projectos` do not need it.

## Rules

- Do not add dependencies without saying so in the PR.
- Do not touch `src/app/api/`, `src/middleware.ts`, `src/services/`,
  environment variables, Redis or anything WordPress-related unless that is
  the task.
- Do not edit `src/styles/globals.css` or `tailwind.config.js` for a single
  page; use Tailwind classes in the page.
- Use `"use client"` only in the component that needs browser interactivity.
- Keep the page working at 390 px wide with no horizontal scroll.
- Never invent content, data, names or sources.

## How changes get in

Work happens on a **fork**. Branch protection requires every change to `main`
to come through a pull request, which a maintainer reviews and merges.

1. Fork `pagina-um/p1-headless-next` on GitHub and clone the fork.
2. Add the original as `upstream` and keep `main` in sync with it.
3. Branch from `main`: `projecto/<slug>` for a special project,
   `fix/<what>` or `feature/<what>` otherwise.
4. Run types, lint and build. All three must pass.
5. Open the PR from the fork against `pagina-um/p1-headless-next:main`,
   with a description that says what it is, how it was verified and what was
   left out.

`CONTRIBUTING.md` has the git commands for each step. After the merge, Vercel
deploys `main` on its own.
