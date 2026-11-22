# Religious heritage: interactive infographic

This directory contains the self-contained PÁGINA UM infographic requested for
embedding in the religious-heritage investigation. The reader-facing interface
uses European Portuguese and pre-1990 spelling.

## Delivery and scope

- `infografia.html` contains the HTML, CSS, JavaScript, records and municipal
  geography. No installation, API, map tiles, external font or third-party script
  is required. The application makes no network requests until a reader follows
  a source link.
- After deployment, its path is
  `/projectos/patrimonio-religioso/infografia.html`.
- Add `?embed=1` to hide the standalone introduction while keeping the filters,
  map, timeline, record details, sources and methodology.
- The URL fragment preserves the selected year, universe, mode and filters.
- This is an article asset. It does not add a project to the project registry,
  replace the homepage promotion, edit WordPress or publish the article.

## Embed in an article

Add the iframe through the newspaper's supported article integration:

```html
<iframe
  id="p1-patrimonio"
  src="/projectos/patrimonio-religioso/infografia.html?embed=1"
  title="Património religioso: mapa, tipologias e cronologia"
  style="display:block;width:100%;height:2100px;border:0"
  loading="lazy"
></iframe>
```

The fixed height is a fallback with internal scrolling. For an iframe that grows
and shrinks with the content, install this listener in the parent integration
before the frame loads:

```js
window.addEventListener('message', event => {
  const frame = document.getElementById('p1-patrimonio');
  if (!frame || event.origin !== location.origin ||
      event.source !== frame.contentWindow) return;
  if (event.data?.type !== 'p1-infografia-height' ||
      event.data?.id !== 'p1-patrimonio') return;
  const height = Number(event.data.height);
  if (Number.isFinite(height) && height >= 300 && height <= 20000) {
    frame.style.height = Math.ceil(height) + 'px';
  }
});
```

The child measures the content element, not the iframe viewport, so closing
details and reducing the result set can reduce the height. A `ResizeObserver`
sends subsequent measurements. The listener is scoped to this frame and the
same origin.

If WordPress strips scripts, keep this listener in the site's existing article
integration instead of pasting scripts into the article body. A sandbox, if
required by the publisher's policy, must be evaluated for scripts, source links
in new windows and CSV downloads. The same-origin height listener above assumes
the frame retains its origin. The ordinary iframe example intentionally contains
no sandbox attribute for this trusted, same-origin static asset.

The private editorial preview on ChatGPT Sites is not the reader-facing embed
URL. This file is served directly by the newspaper after review and deployment.

## Data and editorial method

Source edition: PÁGINA UM's workbook
`Igrejas_catolicas_Portugal_2022_2026(1).xlsx` and the accompanying investigation,
“O património católico atacado que Portugal conhece aos pedaços”. Documentary
cutoff: **19 November 2026**. Infographic prepared on **22 November 2026**.

The two universes remain separate:

- **123 principal records** about churches, chapels, Catholic heritage and
  clergy, in **63 municipalities**.
- **83 cemetery records**, associated with **75 deduplicated sites** in
  **43 municipalities**.

Each record retains its source links, original date description, date role,
precision and verification notes. The source descriptions and linked reports
are part of the embedded dataset. These are documentary records, not necessarily
unique buildings, individual crimes, or proven cases of religious hatred.
Coverage is partial and 2026 ends on 19 November, not at the end of the year.

### Temporal precision

The annual principal count includes records attributed to that year. A
cross-year interval remains a separate possible record in each compatible
annual view. In cumulative mode it enters the principal count once its upper
year is included, and its original uncertainty remains visible. It is never
duplicated in the accumulated total.

| Universe | Annual principal counts, 2022–2026 | Cumulative principal counts, 2022–2026 |
| --- | --- | --- |
| Churches / heritage / clergy | 22, 27, 35, 19, 19, plus one cross-year record | 22, 49, 84, 104, 123 |
| Cemeteries | 16, 15, 9, 32, 10, plus one cross-year record | 16, 31, 40, 72, 83 |

`C024` retains 2024–2025. `CEM-083` retains 2025–2026. `CEM-033` remains
approximately 2024 rather than taking the year of its 2025 retrospective report.
Dates known only by month or year do not gain an invented day. Discovery and
publication dates remain qualified when the event date is unknown.

The cumulative animation shows accumulation of the documented records, not an
increase in event frequency. Typologies are primary editorial categories, retain
co-occurring damage in the record text, and do not establish motive.

### Geography

The embedded geography covers the 308 municipalities, from official DGT/CAOP
administrative data distributed through LNEG, with source attribution in the
infographic. Records are assigned to their documented municipality. Map symbols
use municipal reference points and are explicitly not exact building locations.
The mainland, Madeira and the Azores use separate map frames and scales.
Displaced symbols retain leader lines to their municipal anchors.

## Reader controls

Year steps from 2022 to 2026; play, pause, previous and next; speed selection;
period and cumulative views; separate universes; typology, territory and text
search; map filtering; expanded source-linked records; and CSV export of the
selection. All views use the same selected records. Playback pauses on reader
interaction and when the tab becomes hidden. Reduced-motion preferences are
respected.

## Maintenance and verification

The exported HTML includes readable application code and a JSON data script.
Keep record IDs, source links, the distinction between the two universes, date
precision and municipality mapping when updating the edition. Review any new
records editorially before adding them. Updates enter through a new fork branch
and pull request using the repository's normal workflow.

The editorial build was checked in a wide viewport and 390/320 px responsive
frames, including filter synchronisation, source details, interval handling,
playback and overlapping map symbols. Its 12 existing data/temporal-engine tests
passed. This repository copy adds the content-based height measurement described
above. The PR records the repository type, lint, build and deployment results
separately, including any environment limitations.
