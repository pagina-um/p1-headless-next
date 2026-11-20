import type { CaseIndex, CaseRecord, Filters, Party } from "./types";

export const SLUG = "casos-de-politica";
export const BASE = `/projecto/${SLUG}`;
export const PROTOTYPE = "https://arquivo-politico-pav.pav-1969.chatgpt.site";
export const NAV = [
  { label: "Síntese", href: BASE },
  ...[
    ["Casos", "casos"],
    ["Partidos", "partidos"],
    ["Pessoas", "pessoas"],
    ["Cronologia", "cronologia"],
    ["Método", "metodo"],
  ].map(([label, path]) => ({ label, href: `${BASE}/${path}` })),
];
export const GROUPS = [
  {
    id: "criminal",
    label: "Condenações criminais",
    phases: ["Condenações criminais"],
  },
  {
    id: "otherConvictions",
    label: "Cíveis, financeiras e coimas",
    phases: [
      "Condenações cíveis",
      "Condenações financeiras",
      "Condenações contra-ordenacionais",
    ],
  },
  {
    id: "mandate",
    label: "Perdas de mandato decretadas",
    phases: ["Perdas de mandato"],
  },
  {
    id: "pending",
    label: "Pendentes / desfecho por apurar",
    phases: [
      "Investigações",
      "Acusações e julgamentos",
      "Acções administrativas",
    ],
  },
  {
    id: "favourable",
    label: "Absolvições e arquivamentos",
    phases: ["Absolvições", "Arquivamentos"],
  },
  { id: "other", label: "Outros desfechos", phases: [] },
];
export const PHASES = [
  "Condenações criminais",
  "Condenações cíveis",
  "Condenações financeiras",
  "Condenações contra-ordenacionais",
  "Perdas de mandato",
  "Acusações e julgamentos",
  "Investigações",
  "Acções administrativas",
  "Decisões administrativas",
  "Decisões internacionais",
  "Absolvições",
  "Arquivamentos",
  "Perdas de mandato revogadas ou anuladas",
  "Pedidos de perda de mandato rejeitados",
  "Responsabilidade relevada",
  "Dispensa de multa",
  "Prescrições e extinções",
  "Condenações anuladas",
  "Documentos oficiais",
];
export const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-PT");
export function formatDate(value: string | null) {
  if (!value) return "Data não indicada";
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value))
    return new Intl.DateTimeFormat("pt-PT", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(`${value}-01T12:00:00Z`));
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}
export const belongs = (r: Pick<CaseIndex, "parties">, party: string) =>
  party === "independentes"
    ? r.parties.length === 0
    : r.parties.includes(party);
export const phaseFor = (
  r: Pick<CaseIndex, "phase" | "partyOutcomes">,
  party = ""
) => r.partyOutcomes[party] || r.phase;
export function matchesGroup(
  r: Pick<CaseIndex, "category" | "phase" | "partyOutcomes">,
  group: string,
  party = ""
) {
  if (r.category !== "Casos") return false;
  const phase = phaseFor(r, party);
  return group === "other"
    ? !GROUPS.some((g) => g.phases.includes(phase))
    : Boolean(GROUPS.find((g) => g.id === group)?.phases.includes(phase));
}
export function isInquest(r: CaseRecord) {
  return (
    r.category === "Casos" &&
    r.phase === "Investigações" &&
    r.people.some((p) => {
      const s = p.proceduralStatus;
      return (
        s?.code === "arguido" &&
        /^\d{4}-\d{2}-\d{2}$/.test(s.asOf) &&
        s.asOf <= r.checkedAt &&
        r.sources.some((source) => source.href === s.source.href)
      );
    })
  );
}
export function buildIndex(
  records: CaseRecord[],
  parties: Party[]
): CaseIndex[] {
  return records.map((r) => ({
    id: r.id,
    title: r.title,
    summary: r.summary,
    parties: r.parties,
    phase: r.phase,
    nature: r.nature,
    category: r.category,
    status: r.status,
    date: r.date,
    dateLabel: r.dateLabel,
    datePrecision: r.datePrecision,
    year: r.year,
    dateKind: r.dateKind,
    location: r.location,
    caseNumber: r.caseNumber,
    partyOutcomes: r.partyOutcomes,
    people: r.people.map(({ id, name }) => ({ id, name })),
    inquest: isInquest(r),
    mandate: Boolean(r.mandate),
    // The index carries searchable metadata, never the full court dossier.
    searchText: normalize(
      [
        r.title,
        r.summary,
        r.location,
        r.caseNumber,
        ...r.people.flatMap((p) => [p.name, p.fullName]),
        ...r.parties.map((id) => {
          const p = parties.find((x) => x.id === id);
          return p ? `${p.abbr} ${p.name}` : id;
        }),
      ].join(" ")
    ),
  }));
}
export const EMPTY_FILTERS: Filters = {
  q: "",
  party: "",
  phase: "",
  nature: "",
  year: "",
  category: "",
  group: "",
  inquest: false,
  mandate: false,
  sort: "desc",
};
export function readFilters(params: URLSearchParams): Filters {
  return {
    q: params.get("q") || "",
    party: params.get("p") || "",
    phase: params.get("s") || "",
    nature: params.get("n") || "",
    year: params.get("y") || "",
    category: params.get("c") || "",
    group: params.get("g") || "",
    inquest: params.get("u") === "arguidos-inquerito",
    mandate: params.get("m") === "all",
    sort: params.get("sort") || "desc",
  };
}
export function filterParams(f: Filters) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries({
    q: f.q,
    p: f.party,
    s: f.phase,
    n: f.nature,
    y: f.year,
    c: f.category,
    g: f.group,
    u: f.inquest ? "arguidos-inquerito" : "",
    m: f.mandate ? "all" : "",
    sort: f.sort === "desc" ? "" : f.sort,
  }))
    if (value) p.set(key, value);
  return p;
}
export function filterIndex(index: CaseIndex[], f: Filters) {
  const q = normalize(f.q.trim());
  return index
    .filter(
      (r) =>
        (!q || r.searchText.includes(q)) &&
        (!f.party || belongs(r, f.party)) &&
        (!f.phase || phaseFor(r, f.party) === f.phase) &&
        (!f.nature || r.nature === f.nature) &&
        (!f.year || String(r.year) === f.year) &&
        (!f.category || r.category === f.category) &&
        (!f.group || matchesGroup(r, f.group, f.party)) &&
        (!f.inquest || r.inquest) &&
        (!f.mandate || r.mandate)
    )
    .sort((a, b) =>
      f.sort === "alpha"
        ? a.title.localeCompare(b.title, "pt")
        : (f.sort === "asc" ? 1 : -1) *
            (a.dateLabel || String(a.year)).localeCompare(
              b.dateLabel || String(b.year)
            ) || a.title.localeCompare(b.title, "pt")
    );
}
export function summaryRows(index: CaseIndex[], parties: Party[]) {
  return [
    ...parties.map(({ id, abbr, name, historical }) => ({
      id,
      abbr,
      name,
      historical,
    })),
    {
      id: "independentes",
      abbr: "Sem partido associado",
      name: "Independentes ou filiação não confirmada na ficha",
      historical: false,
    },
  ].map((p) => {
    const cases = index.filter(
      (r) => r.category === "Casos" && belongs(r, p.id)
    );
    return {
      ...p,
      total: cases.length,
      groups: Object.fromEntries(
        GROUPS.map((g) => [
          g.id,
          cases.filter((r) => matchesGroup(r, g.id, p.id)).length,
        ])
      ),
    };
  });
}
export type SummaryRow = ReturnType<typeof summaryRows>[number];
export function csvCell(value: unknown) {
  let text =
    typeof value === "object" && value !== null
      ? JSON.stringify(value)
      : String(value ?? "");
  if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return `"${text.replace(/"/g, '""')}"`;
}
export function toCSV(rows: object[]) {
  if (!rows.length) return "\uFEFF";
  const keys = Object.keys(rows[0]);
  return (
    "\uFEFF" +
    [
      keys,
      ...rows.map((r) =>
        keys.map((key) => (r as Record<string, unknown>)[key])
      ),
    ]
      .map((row) => row.map(csvCell).join(";"))
      .join("\r\n")
  );
}
