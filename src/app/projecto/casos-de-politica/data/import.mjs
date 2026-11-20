// Import the published prototype without changing its editorial decisions.
// node data/import.mjs <prototype-checkout> [published-portraits.json] [approved-images-dir]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const [source, publishedPortraits, approvedImages] = process.argv.slice(2);
if (!source) throw new Error("Provide the prototype checkout path.");
const dataDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dataDir, "../../../../..");
const assetDir = path.join(root, "public/projectos/casos-de-politica");
const assetURL = "/projectos/casos-de-politica";
const origin = "https://arquivo-politico-pav.pav-1969.chatgpt.site";
const context = { window: {} };
vm.createContext(context);
for (const [, file] of fs
  .readFileSync(path.join(source, "app/page.html"), "utf8")
  .matchAll(/<script src="([^"]+)"/g)) {
  if (["app.js", "portraits.js"].includes(file)) continue;
  vm.runInContext(
    fs.readFileSync(path.join(source, "public", file), "utf8"),
    context,
    { filename: file }
  );
}
const a = context.window.ARCHIVE;
const slug = (name) =>
  name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
const fullDate = (value) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : null;
const dated = (value) => ({
  date: fullDate(value),
  dateLabel: value || "",
  datePrecision: value
    ? ["year", "month", "day"][value.split("-").length - 1]
    : null,
});
const sourceLink = (s) => ({
  label: s.label || "Consultar a fonte",
  href: s.url,
  kind: s.kind || "",
});
const proof = (p) => ({
  person: p.person || "",
  party: p.party || "",
  description: p.description || "",
  period: p.period || "",
  source: { label: p.label || "Consultar a fonte", href: p.url },
});
const records = a.records.map((r) => ({
  id: r.id,
  parties: r.parties,
  category: r.category,
  nature: r.nature,
  phase: r.phase,
  status: r.status,
  ...dated(r.date),
  dateKind: r.dateKind,
  year: r.year,
  title: r.title,
  summary: r.summary,
  detail: r.detail,
  affiliation: r.affiliation || "",
  finality: r.finality || "",
  penalty: r.penalty || "",
  amount: r.amount ?? null,
  caseNumber: r.caseNumber || "",
  court: r.court || "",
  location: r.location || "",
  topic: r.topic || "",
  procedureType: r.procedureType || "",
  reference: r.reference,
  sourceName: r.source,
  source: { label: r.reference || r.source, href: r.url },
  checkedAt: r.checkedAt,
  researchBatch: r.researchBatch || "",
  related: r.related,
  partyOutcomes: r.partyOutcomes || {},
  people: r.people.map((p) => ({
    id: slug(p.name),
    name: p.name,
    fullName: p.fullName || "",
    role: p.role,
    proceduralStatus: p.proceduralStatus
      ? {
          code: p.proceduralStatus.code,
          label: p.proceduralStatus.label,
          asOf: p.proceduralStatus.asOf,
          source: {
            label: "Fonte do estatuto processual",
            href: p.proceduralStatus.sourceUrl,
          },
        }
      : null,
  })),
  timeline: (r.timeline || []).map(([date, text]) => ({
    ...dated(date),
    text,
  })),
  sources: r.sources.map(sourceLink),
  mandate: r.mandate
    ? {
        jurisdiction: r.mandate.jurisdiction,
        outcome: r.mandate.outcome,
        decisionDate: fullDate(r.mandate.decisionDate),
        decisionDateLabel: r.mandate.decisionDate || "",
        finality: r.mandate.finality || "",
        court: r.mandate.court || "",
        proceedings: r.mandate.proceedings || "",
        reason: r.mandate.reason || "",
        scope: r.mandate.scope || "",
        decisionSource: r.mandate.decisionSource || "",
      }
    : null,
  entityCases: (r.entityCases || []).map((e) => ({
    name: e.name,
    kind: e.kind || "",
    type: e.type || "",
    municipality: e.municipality || "",
    people: e.people || [],
    connection: e.connection || "",
    entityEvidence: (e.entityEvidence || []).map(proof),
    roleEvidence: (e.roleEvidence || []).map(proof),
    membershipEvidence: (e.membershipEvidence || []).map(proof),
    politicalRoleEvidence: (e.politicalRoleEvidence || []).map(proof),
  })),
}));
fs.mkdirSync(assetDir, { recursive: true });
fs.cpSync(
  path.join(source, "public/party-logos"),
  path.join(assetDir, "logotipos"),
  { recursive: true }
);
fs.mkdirSync(path.join(assetDir, "fotografias"), { recursive: true });
const parties = a.parties.map((p) => {
  const logo = context.window.PARTY_LOGOS[p.id];
  return {
    id: p.id,
    name: p.name,
    abbr: p.abbr,
    registered: p.registered || null,
    historical: Boolean(p.historical),
    extinguished: p.extinguished || null,
    source: {
      label: p.historical
        ? "Registo histórico · TC / CNE"
        : "Tribunal Constitucional · lista de partidos",
      href: p.registrationSource || p.source || a.partySource,
    },
    logo: logo
      ? {
          src: assetURL + "/logotipos/" + path.basename(logo.src),
          source: { label: logo.sourceName, href: logo.sourcePage },
          original: logo.sourceUrl,
          author: logo.author || "",
          license: logo.license || "",
          licenseUrl: logo.licenseUrl || "",
          changes: logo.changes || "",
          checkedAt: logo.checkedAt,
        }
      : null,
  };
});
const portraits = publishedPortraits
  ? JSON.parse(fs.readFileSync(publishedPortraits, "utf8")).portraits
  : JSON.parse(
      fs.readFileSync(path.join(source, "public/portrait-seed.json"), "utf8")
    );
const people = new Map();
for (const r of records)
  for (const p of r.people) {
    if (!people.has(p.id))
      people.set(p.id, {
        id: p.id,
        name: p.name,
        fullNames: [],
        recordIds: [],
        source: r.source,
        portrait: null,
      });
    const person = people.get(p.id);
    if (person.name !== p.name)
      throw new Error("Person slug collision: " + p.id);
    if (p.fullName && !person.fullNames.includes(p.fullName))
      person.fullNames.push(p.fullName);
    if (!person.recordIds.includes(r.id)) person.recordIds.push(r.id);
  }
for (const [id, p] of Object.entries(portraits)) {
  if (!people.has(id) || !p.credit || !p.license)
    throw new Error("Incomplete portrait provenance: " + id);
  const custom = Boolean(p.custom);
  if (custom && !approvedImages)
    throw new Error("Provide the approved public images folder: " + id);
  const filename = custom ? id + ".jpg" : path.basename(p.url);
  const local = custom
    ? path.join(approvedImages, filename)
    : path.join(source, "public", p.url);
  fs.copyFileSync(local, path.join(assetDir, "fotografias", filename));
  people.get(id).portrait = {
    src: assetURL + "/fotografias/" + filename,
    credit: p.credit,
    license: p.license,
    source: p.sourceUrl
      ? { label: "Origem da fotografia", href: p.sourceUrl }
      : null,
    licenseUrl: p.licenseUrl || "",
    position: p.position ?? 50,
    approval: custom
      ? "Fotografia aprovada na administração do protótipo e publicada à data da extracção."
      : "Licença identificada no arquivo de origem.",
  };
}
const write = (file, value) =>
  fs.writeFileSync(
    path.join(dataDir, file),
    JSON.stringify(value, null, 2) + "\n"
  );
write(
  "casos.json",
  records.filter((r) => r.category === "Casos")
);
write(
  "documentos.json",
  records.filter((r) => r.category !== "Casos")
);
write("partidos.json", parties);
write(
  "pessoas.json",
  [...people.values()].sort((x, y) => x.name.localeCompare(y.name, "pt"))
);
write("manifesto.json", {
  title: "Casos de Política",
  extractedAt: "2026-11-20",
  checkedAt: a.updated,
  source: { label: "Protótipo Casos de Política · versão 21", href: origin },
  sourceCommit: "51afb264c9b2ceabd00f53116a9faa5baea4c877",
  caseAliases: a.caseAliases || {},
  coverage:
    "Selecção parcial. A data da consulta das fontes não certifica o estado actual de todos os processos.",
  cases: records.filter((r) => r.category === "Casos").length,
  documents: records.filter((r) => r.category !== "Casos").length,
  people: people.size,
  currentParties: parties.filter((p) => !p.historical).length,
  historicalParties: parties.filter((p) => p.historical).length,
  photographs: Object.keys(portraits).length,
});
console.log(
  `${records.length} records, ${people.size} people, ${parties.length} parties imported.`
);
