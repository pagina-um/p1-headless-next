# Design language

How paginaum.pt looks, and how to make a new page look like it belongs. Read
this before building any page or block. Where a component already exists in
`src/components/`, use it rather than restyling.

## Character

Sober, typographic, newspaper-like. Hierarchy comes from type size and
weight, not from colour or decoration. White cards on a light grey ground,
thin borders, small uppercase labels. Nothing flashes.

## Type

| Role | Classes | Notes |
| --- | --- | --- |
| Headlines, section titles | `font-serif font-bold` | Playfair Display, loaded in `globals.css`. Always bold. |
| Big display word (one per page at most) | `font-instrument` | Instrument Serif, as in the Cultura banner. Never for running text. |
| Running text, UI | default (no font class) | The system sans-serif stack. |
| Small labels, kickers | `text-[11px] uppercase tracking-wider text-stone-500` | Letter-spacing between `tracking-wider` and `tracking-[0.3em]`. |

Sizes in use: page title `text-4xl md:text-6xl`, section title `text-2xl
md:text-3xl`, card title `text-2xl` or `text-lg`, body `text-base md:text-lg
leading-relaxed`. Keep to these; do not invent intermediate sizes.

## Colour

| Token | Value | Use |
| --- | --- | --- |
| `bg-gray-100` | page background | set by the root layout |
| `bg-white` | cards, header, content bands | |
| `border-gray-200` | all borders | `border-gray-300` for form controls |
| `text-stone-900` / `-600` / `-500` | primary / secondary / tertiary text | |
| `text-primary`, `bg-primary` | `#cf2e2e`, the Página UM red | links in text, primary buttons, brand only |
| `primary-dark` | `#920a0a` | hover states, dividers' titles |
| `#f5ecd9`…`#e8d9b0` (amber) | Cultura section | do not reuse elsewhere |
| `#009588` / `#00786e` | Corpus | do not reuse elsewhere |

A special project or section gets **one** colour of its own, saturated, with
a darker variant, declared once in `src/projectos/registry.ts`. It appears in
details (a 4 px top border, an icon, the active tab, key figures) and as the
background of its promo card and banner. Never as the background of running
text. Avoid red (brand), amber (Cultura) and teal (Corpus).

## Layout

- Outer container `max-w-7xl mx-auto px-4`. Running text inside `max-w-3xl`.
- Vertical rhythm with `gap` on flex/grid or `mt-*` on sections; `py-8
  md:py-12` between major bands.
- Cards: `bg-white border border-gray-200 rounded-md shadow-sm`, inner
  padding `p-4` or `p-5`. Use card styling only for things that are objects
  (a project, a record, a figure), not for every block of text.
- Key figures: a `dl` grid of 3–4 cards, label in small caps above a bold
  serif number. Never more than four.
- Wide tables go inside `<div className="overflow-x-auto">`.
- Mobile first. Write classes for the narrow screen and add `md:`/`lg:`
  variants. The homepage grid is 10 columns at `lg`, one column below.

## Components to reuse

| Need | Use |
| --- | --- |
| Site header + nav | `Header` from `src/components/layout/Header.tsx` (pass `section` for a section label under the logo) |
| Footer | `PostFooter` from `src/components/post/PostFooter.tsx` |
| Project page frame | `ProjectoShell` from `src/components/projectos/ProjectoShell.tsx` |
| Project card / homepage block | `ProjectoCard` |
| Icons | `lucide-react` only |
| Images | `next/image`, with `alt`; files in `public/` |
| Buttons, inputs, dialogs | `src/components/ui/` |

## Copy

European Portuguese, pre-1990 spelling (see `AGENTS.md`). Short sentences.
Labels say what happens ("Explorar", "Ver tudo", "Subscrever"). Every factual
claim has a source. A project that catalogues court cases says, in its
summary and method, that an accusation is not proof of guilt.
