import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
const archiveSource = fs.readFileSync(
  new URL("../_lib/archive.ts", import.meta.url),
  "utf8"
);
const archiveModule = ts.transpileModule(archiveSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const {
  buildIndex,
  summaryRows,
  filterIndex,
  EMPTY_FILTERS,
  isInquest,
  formatDate,
  toCSV,
} = await import(
  `data:text/javascript;base64,${Buffer.from(archiveModule).toString("base64")}`
);
const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (name) =>
  JSON.parse(fs.readFileSync(path.join(dir, name + ".json"), "utf8"));
const cases = read("casos"),
  documents = read("documentos"),
  people = read("pessoas"),
  parties = read("partidos"),
  manifest = read("manifesto");
const records = [...cases, ...documents];
const index = buildIndex(records, parties);

function verifyDisplayDate(value, field) {
  assert.match(
    value,
    /^(?:\d{4}(?:-\d{2}(?:-\d{2})?)?)?$/,
    `${field}: expected YYYY, YYYY-MM, YYYY-MM-DD or an empty label`
  );
  if (value.length >= 7) {
    const day = value.length === 7 ? `${value}-01` : value;
    const parsed = new Date(`${day}T12:00:00Z`);
    assert(
      Number.isFinite(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === day,
      `${field}: invalid calendar date ${value}`
    );
  }
  assert.doesNotThrow(() => formatDate(value), `${field}: ${value}`);
}

function verifyDated({ date, dateLabel, datePrecision }, field) {
  verifyDisplayDate(dateLabel, `${field}.dateLabel`);
  const precision = { 0: null, 4: "year", 7: "month", 10: "day" }[
    dateLabel.length
  ];
  assert.equal(datePrecision, precision, `${field}.datePrecision`);
  assert.equal(date, precision === "day" ? dateLabel : null, `${field}.date`);
}

verifyDisplayDate(manifest.checkedAt, "manifest.checkedAt");
verifyDisplayDate(manifest.extractedAt, "manifest.extractedAt");
for (const party of parties) {
  if (party.registered !== null)
    verifyDisplayDate(party.registered, `${party.id}.registered`);
  if (party.extinguished !== null)
    verifyDisplayDate(party.extinguished, `${party.id}.extinguished`);
}

assert.equal(cases.length, 481);
assert.equal(documents.length, 1);
assert.equal(people.length, 559);
assert.equal(parties.filter((p) => !p.historical).length, 24);
assert.equal(parties.filter((p) => p.historical).length, 4);
const ids = new Set(records.map((r) => r.id));
assert.equal(ids.size, records.length);
for (const dataset of [cases, documents, people, parties]) {
  const keys = Object.keys(dataset[0]).sort();
  for (const row of dataset) {
    assert.deepEqual(Object.keys(row).sort(), keys, row.id);
    assert(row.source.label && /^https?:\/\//.test(row.source.href), row.id);
  }
}
for (const r of records) {
  verifyDated(r, r.id);
  verifyDisplayDate(r.checkedAt, `${r.id}.checkedAt`);
  assert(
    r.amount === null ||
      (typeof r.amount === "number" && Number.isFinite(r.amount)),
    `${r.id}: amount must be numeric or null`
  );
  for (const p of r.people) {
    const status = p.proceduralStatus;
    if (status === null) continue;
    assert(
      status && typeof status === "object",
      `${r.id}: invalid procedural status for ${p.id}`
    );
    assert(typeof status.code === "string" && status.code.trim(), r.id);
    assert(typeof status.label === "string" && status.label.trim(), r.id);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(status.asOf), r.id);
    verifyDisplayDate(status.asOf, `${r.id} / ${p.id}.proceduralStatus.asOf`);
    assert(
      status.source?.label && /^https?:\/\//.test(status.source?.href),
      `${r.id}: missing procedural source`
    );
  }
  assert(r.sources.length > 0, r.id);
  for (const s of r.sources)
    assert(s.label && /^https?:\/\//.test(s.href), r.id);
  for (const p of r.parties)
    assert(
      parties.some((x) => x.id === p),
      r.id
    );
  for (const [party, outcome] of Object.entries(r.partyOutcomes)) {
    assert(r.parties.includes(party), r.id);
    assert(typeof outcome === "string" && outcome.trim(), r.id);
  }
  for (const p of r.people)
    assert(
      people.some(
        (x) => x.id === p.id && x.name === p.name && x.recordIds.includes(r.id)
      ),
      r.id
    );
  for (const id of r.related) assert(ids.has(id) && id !== r.id, r.id);
  for (const [i, event] of r.timeline.entries())
    verifyDated(event, `${r.id}.timeline[${i}]`);
  if (Array.isArray(r.mandate?.proceedings)) {
    for (const [i, proceeding] of r.mandate.proceedings.entries())
      verifyDisplayDate(
        proceeding.decisionDate ?? "",
        `${r.id}.mandate.proceedings[${i}].decisionDate`
      );
  }
  if (r.phase === "Perdas de mandato")
    assert(["decreed", "effective"].includes(r.mandate?.outcome), r.id);
  if (
    ["reversed", "rejected", "pending", "extinguished", "archived"].includes(
      r.mandate?.outcome
    )
  )
    assert.notEqual(r.phase, "Perdas de mandato", r.id);
}
const rows = summaryRows(index, parties);
for (const row of rows) {
  assert.equal(
    Object.values(row.groups).reduce((a, b) => a + b, 0),
    row.total,
    row.id
  );
  for (const [group, count] of Object.entries(row.groups))
    assert.equal(
      filterIndex(index, { ...EMPTY_FILTERS, party: row.id, group }).length,
      count,
      row.id + group
    );
}
const ctt = index.find(
  (r) => r.id === "ctt-horta-costa-vilar-negocios-2002-2005"
);
assert.equal(
  filterIndex([ctt], { ...EMPTY_FILTERS, party: "PSD", group: "criminal" })
    .length,
  0
);
assert.equal(
  filterIndex([ctt], { ...EMPTY_FILTERS, party: "PSD", group: "favourable" })
    .length,
  1
);
assert.equal(
  filterIndex([ctt], { ...EMPTY_FILTERS, party: "PS", group: "criminal" })
    .length,
  1
);
const calheta = index.find(
  (r) => r.id === "calheta-baeta-contabilizacao-valor-ambiente"
);
assert.equal(
  filterIndex([calheta], {
    ...EMPTY_FILTERS,
    party: "CDS",
    group: "otherConvictions",
  }).length,
  0
);
assert.equal(
  filterIndex([calheta], {
    ...EMPTY_FILTERS,
    party: "CDS",
    group: "favourable",
  }).length,
  1
);
assert.equal(
  filterIndex([calheta], {
    ...EMPTY_FILTERS,
    party: "PSD",
    group: "otherConvictions",
  }).length,
  1
);
assert.equal(cases.filter(isInquest).length, 5);
const influencer = cases.find((r) => r.id === "influencer-inqueritos");
assert.equal(
  influencer.people.find((p) => p.name === "António Costa").proceduralStatus
    .code,
  "suspeito"
);
assert.equal(
  cases.find((r) => r.id === "montenegro-spinumviva-averiguacao-arquivada")
    .phase,
  "Arquivamentos"
);
assert.equal(
  filterIndex(index, { ...EMPTY_FILTERS, q: "antonio costa" }).some(
    (r) => r.id === influencer.id
  ),
  true
);
assert.equal(
  filterIndex(index, { ...EMPTY_FILTERS, category: "Casos" }).length,
  cases.length
);
assert.equal(
  manifest.caseAliases["alipio-dias-bcp-cmvm"],
  "bcp-cmvm-teixeira-pinto-alipio-dias"
);
const root = path.resolve(dir, "../../../../..");
for (const person of people.filter((p) => p.portrait)) {
  assert(
    fs.existsSync(path.join(root, "public", person.portrait.src)),
    person.id
  );
  assert(
    person.portrait.license &&
      person.portrait.credit &&
      person.portrait.approval,
    person.id
  );
}
assert.equal(people.filter((p) => p.portrait).length, 27);
for (const p of parties)
  assert(fs.existsSync(path.join(root, "public", p.logo.src)), p.id);
const caseProps = {
  records: index,
  parties: parties.map(({ id, name, abbr }) => ({ id, name, abbr })),
  initial: EMPTY_FILTERS,
  color: "#1E40AF",
};
const bytes = Buffer.byteLength(JSON.stringify(caseProps));
assert(bytes < 1_000_000, `Client props exceed 1 MB: ${bytes}`);
assert(Buffer.byteLength(JSON.stringify(people)) < 1_000_000);
assert.match(toCSV([{ text: '=HYPERLINK("x")' }]), /'=HYPERLINK/);
if (process.argv[2]) {
  const original = JSON.parse(fs.readFileSync(process.argv[2], "utf8")).archive
    .records;
  assert.equal(records.length, original.length);
  for (const source of original) {
    const r = records.find((x) => x.id === source.id);
    for (const field of [
      "title",
      "summary",
      "detail",
      "phase",
      "nature",
      "status",
      "category",
      "parties",
      "checkedAt",
      "related",
    ])
      assert.deepEqual(r[field], source[field], r.id + " " + field);
    for (const field of [
      "affiliation",
      "penalty",
      "finality",
      "caseNumber",
      "court",
      "location",
    ])
      assert.equal(r[field], source[field] || "", r.id + " " + field);
    assert.deepEqual(
      r.sources.map((s) => s.href),
      source.sources.map((s) => s.url),
      r.id
    );
    assert.deepEqual(
      r.timeline.map((e) => [e.dateLabel, e.text]),
      source.timeline || [],
      r.id
    );
    assert.deepEqual(
      r.people.map((p) => [p.name, p.role]),
      source.people.map((p) => [p.name, p.role]),
      r.id
    );
  }
}
console.log(
  `Data verified: ${cases.length} cases, ${people.length} people; case-list props ${bytes} bytes; mixed outcomes, inquests, dates, links and public portraits preserved.`
);
