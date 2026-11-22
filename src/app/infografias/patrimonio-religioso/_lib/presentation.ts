import { YEARS } from "./timeline";
import type {
  DateRole,
  FilterState,
  HeritageRecord,
  InfographicData,
  RegionFilter,
  TimelineMode,
  VisibleRecord,
  VisibleStatus,
} from "./types";

export const INITIAL_FILTERS: FilterState = {
  universe: "igrejas",
  category: "all",
  query: "",
  region: "all",
  municipality: null,
  year: 2022,
  mode: "period",
  showUncertain: true,
};

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export function humanDate(value: string | number | null | undefined): string {
  return String(value ?? "")
    .replace(/\/(?=20\d{2}-)/g, " a ")
    .replace(/\b(20\d{2})-(\d{2})-(\d{2})\b/g, "$3/$2/$1")
    .replace(
      /\b(20\d{2})-(\d{2})(?![\d/-])/g,
      (_, year, month) => `${MONTHS[Number(month) - 1] ?? month} de ${year}`
    );
}

export function recordDate(record: HeritageRecord): string {
  if (record.isCrossYear) {
    return `${record.yearStart}–${record.yearEnd} · ano por determinar`;
  }
  if (record.yearIsApproximate) {
    return `Cerca de ${record.yearStart} · ano aproximado`;
  }
  const date = humanDate(
    record.dateDisplay ||
      record.dateOriginal ||
      record.yearStart ||
      "Data não apurada"
  );
  const prefixes: Partial<Record<DateRole, string>> = {
    descoberta_ou_alerta: "Descoberta / alerta",
    descoberta_ou_denuncia: "Descoberta / denúncia",
    publicacao_ou_comunicacao: "Notícia / comunicação",
    intervencao_policial: "Intervenção policial",
    periodo_da_serie: "Série de ocorrências",
  };
  const prefix = prefixes[record.dateRole];
  return prefix ? `${prefix}: ${date}` : date;
}

export function precisionLabels(
  record: HeritageRecord,
  status: VisibleStatus,
  mode: TimelineMode
): string[] {
  const labels: string[] = [];
  if (status === "possible") {
    labels.push(
      mode === "period"
        ? "Pode pertencer a este ano"
        : "Pode já pertencer ao acumulado"
    );
  }
  if (status === "undated") labels.push("Sem atribuição temporal");
  if (record.isCrossYear && status === "assigned")
    labels.push("Intervalo entre anos preservado");
  if (record.temporalIsDisputed) labels.push("Datas divergentes nas fontes");
  else if (record.temporalIsApproximate)
    labels.push(
      record.yearIsApproximate ? "Ano aproximado" : "Data aproximada"
    );
  else if (!record.isCrossYear && record.temporalGranularity === "mês")
    labels.push("Precisão: mês");
  else if (!record.isCrossYear && record.temporalGranularity === "ano")
    labels.push("Precisão: ano");
  else if (!record.isCrossYear && record.temporalGranularity === "intervalo")
    labels.push("Intervalo de datas");
  if (record.isSeries) labels.push("Série local · um registo");
  else if (record.isAggregate) labels.push("Registo agregado");
  return labels;
}

export function safeHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function readFilters(hash: string, data: InfographicData): FilterState {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const state = { ...INITIAL_FILTERS };
  const year = Number(params.get("ano"));
  if (YEARS.some((item) => item === year)) state.year = year;
  if (params.get("modo") === "acumulado") state.mode = "cumulative";
  if (params.get("universo") === "cemiterios") state.universe = "cemiterios";
  const category = data.categories[state.universe].find(
    (item) => item.id === params.get("tipo")
  );
  if (category) state.category = category.id;
  const regions: Record<string, RegionFilter> = {
    continente: "continente",
    acores: "acores",
    madeira: "madeira",
    Continente: "continente",
    Açores: "acores",
    Madeira: "madeira",
  };
  const region = params.get("regiao") ?? "";
  state.region = Object.prototype.hasOwnProperty.call(regions, region)
    ? regions[region]
    : "all";
  const municipality = params.get("concelho");
  if (data.geography.municipalities.some((item) => item.id === municipality)) {
    state.municipality = municipality;
  }
  state.query = (params.get("pesquisa") ?? "").slice(0, 200);
  state.showUncertain = params.get("incertos") !== "0";
  return state;
}

export function filterHash(state: FilterState): string {
  const params = new URLSearchParams({
    ano: String(state.year),
    modo: state.mode === "period" ? "periodo" : "acumulado",
    universo: state.universe,
  });
  if (state.category !== "all") params.set("tipo", state.category);
  if (state.region !== "all") params.set("regiao", state.region);
  if (state.municipality) params.set("concelho", state.municipality);
  if (state.query) params.set("pesquisa", state.query);
  if (!state.showUncertain) params.set("incertos", "0");
  return params.toString();
}

/** Keep the original editorial CSV columns and neutralise spreadsheet formulas. */
export function selectionCsv(visible: VisibleRecord[]): string {
  const columns = [
    "ID",
    "Universo",
    "Concelho",
    "Local",
    "Tipologia principal",
    "Descrição",
    "Data original",
    "Função da data",
    "Precisão",
    "Notas temporais",
    "Ano inicial",
    "Ano final",
    "Estado nesta selecção",
    "Notas de verificação",
    "Motivação nas fontes",
    "Fundamento da motivação",
    "Seguimento",
    "Fonte principal",
    "URL",
  ];
  const rows = visible.map(({ record, status }) => [
    record.id,
    record.universe,
    record.municipality,
    record.location,
    record.categoryLabel,
    record.description,
    record.dateOriginal,
    record.dateRoleLabel,
    record.temporalPrecision,
    record.precisionNote,
    record.yearStart,
    record.yearEnd,
    status === "assigned"
      ? "Incluído na contagem principal"
      : status === "possible"
        ? "Intervalo compatível; fora da contagem principal"
        : "Sem atribuição temporal",
    record.verificationNotes,
    record.motivation,
    record.motivationBasis,
    record.followUp,
    record.sourceTitle,
    record.sourceUrl,
  ]);
  const cell = (value: string | number | null) => {
    let text = String(value ?? "");
    if (/^[=+@-]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  };
  return (
    "\uFEFF" +
    [columns, ...rows].map((row) => row.map(cell).join(";")).join("\r\n")
  );
}
