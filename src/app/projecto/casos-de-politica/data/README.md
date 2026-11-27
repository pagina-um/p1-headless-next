# Casos de Política — imported edition

Imported on 2026-11-20 from the published prototype, version 21, source commit
`51afb264c9b2ceabd00f53116a9faa5baea4c877`.

- `casos.json`: 490 cases (464 imported and 26 added in subsequent editorial reviews), including 7 party-account decisions.
- `documentos.json`: 1 reference document, excluded from case totals.
- `pessoas.json`: 566 people (535 imported and 31 added in subsequent editorial reviews); 27 publicly published portraits with credits/licences.
- `partidos.json`: 24 current and 4 historical parties, with registration sources and symbol provenance.
- `manifesto.json`: edition metadata, coverage and the preserved case alias.

Each entity has a source (`label`, `href`). All records within an entity share
the same fields. Unknown fields are blank or null. Complete dates use YYYY-MM-DD.
`dateLabel` preserves a source date known only to month/year; `date` is null in
that situation. No artificial day is introduced. `timeline` follows the same rule.

Person roles and procedural status remain attached to individual cases. A party
associated with a case is not automatically assigned as every participant's
membership. `partyOutcomes` preserves mixed decisions in the party summary.
Public-manager evidence remains in `entityCases`. Reversed administrative mandate
losses and rejected applications retain their separate classifications.

The public portrait endpoint was read once for this edition. Only published
image files and public credits/licences were imported. The existing approval
workflow, pending proposals, account data, private audit log and credentials
were not copied. New proposals still go to the prototype's moderated service.
The imported Rui Cristina image was already publicly approved there and marked
as authorised. The remaining 26 images retain the source's licence references.

Reproduce from a trusted copy of the prototype source:

```sh
node src/app/projecto/casos-de-politica/data/import.mjs \
  /path/to/prototype \
  /path/to/public-portraits.json \
  /path/to/approved-images
node src/app/projecto/casos-de-politica/data/verify.mjs
```

The importer executes the prototype's trusted local data scripts in their
original order. Never run it on unreviewed third-party scripts. The optional
published-portraits input must come from the public endpoint, not from the
private moderation tables. Approved custom images must be supplied separately.
Future imports must update and verify the edition/source commit in the importer.

The browser receives a compact searchable index only. Full records and evidence
are rendered in server pages and exported through the read-only `dados` route.
No new API keys, runtime database, dependencies or production configuration are
required. The URL prefix `/projecto` is the owner's explicit choice; the project
registry uses `routeBase` to keep this an internal project in `/projectos`.

## Validation and deployment

The migration verifier uses the repository's existing TypeScript compiler and
checks data integrity, source preservation, mixed party outcomes, mandate
classifications, individual procedural status, public assets and client payload
size. It does not re-investigate or certify the current state of each case.

The project was reviewed at desktop width and in a 390 px frame, including
search, party ordering, links between records and people, and JSON/CSV downloads.
The full application build requires the original site's WordPress, Stripe and KV
configuration. Local compilation reached prerendering but stopped on the existing
`/cultura` page because KV credentials were absent. That was the migration's
local validation; each editorial PR requires a fresh Vercel build. No production
credentials or environment files are included in this change.

## Editorial revision prepared on 2026-11-25

Two new acquittal records (Miguel Esteves and Sónia Paixão) and two updates
(Hernâni Ribeiro and Roberto Silva) are prepared for editorial review. See
`revisao/2026-11-25.md` and its before/after JSON. This branch is not a
publication. The original import provenance is retained. The manifest check
date reflects the latest consulted sources, not a new verification of every
case. Each record retains its own check date.

## Editorial revision prepared on 2026-11-26

Two separate Calheta financial proceedings are added after checking the official
judgments and electoral maps. The mixed decision preserves the CDS councillors'
acquittal in party filters. See `revisao/2026-11-26.md` and its before/after JSON.
Recent Oeiras reporting remains a research lead pending clarification of the
inquiry status. Publication and editorial approval are not implied by this review.

## Second editorial revision prepared on 2026-11-26

Two recent criminal developments involving Vizela and Gouveia e Melo, and three
historical financial decisions concerning Vendas Novas and Vila do Conde are
added after checking the decisions, appeal outcomes and political links. The
two Vila do Conde records concern distinct proceedings and are not merged into
a single event.
See `revisao/2026-11-26-noite.md` and its structured change summary. The Oeiras
reporting remains excluded from the public records because the current status
of the alleged new inquiry is contradicted by the municipality and had not been
clarified by the PGR at the time of checking.

## Editorial review prepared on 2026-11-27

Eight records are proposed for editorial review. They cover a Maia judgment
dated 19 November, the disclosure of a Calheta non-committal order on
20 November, and six earlier proceedings. The cases of Oeiras and Seixal use
the official Tribunal de Contas distribution records for each separate financial
proceeding. See [the research log](revisao/2026-11-27-varrimento.md) for the
sources, the dates that could be established and the outstanding questions.
