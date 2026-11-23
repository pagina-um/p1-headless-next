import type {
  FilterState,
  HeritageRecord,
  MunicipalityGroup,
  TemporalStatus,
  TimelineMode,
  TimelineSelection,
  TimelineSeriesPoint,
  VisibleRecord,
  VisibleStatus,
} from "./types";

export const YEARS = [2022, 2023, 2024, 2025, 2026] as const;

export function normalise(value: unknown): string {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Preserve the approved annual attribution and cross-year interval rules. */
export function temporalStatus(
  record: Pick<HeritageRecord, "yearStart" | "yearEnd">,
  year: number,
  mode: TimelineMode
): TemporalStatus {
  const first = record.yearStart;
  const last = record.yearEnd;
  if (
    typeof first !== "number" ||
    typeof last !== "number" ||
    !Number.isInteger(first) ||
    !Number.isInteger(last)
  ) {
    return "undated";
  }
  if (mode === "cumulative") {
    if (last <= year) return "assigned";
    return first <= year ? "possible" : "outside";
  }
  if (first === last) return first === year ? "assigned" : "outside";
  return first <= year && year <= last ? "possible" : "outside";
}

export function filterBase(
  records: readonly HeritageRecord[],
  state: FilterState
): HeritageRecord[] {
  const terms = normalise(state.query).split(/\s+/).filter(Boolean);
  return records.filter((record) => {
    if (record.universe !== state.universe) return false;
    if (state.category !== "all" && record.categoryId !== state.category) {
      return false;
    }
    if (state.region !== "all" && record.mapRegion !== state.region)
      return false;
    if (state.municipality && record.municipalityId !== state.municipality) {
      return false;
    }
    const haystack = normalise(
      [
        record.location,
        record.municipality,
        record.district,
        record.description,
        record.originalType,
        record.id,
      ].join(" ")
    );
    return terms.every((term) => haystack.includes(term));
  });
}

const STATUS_ORDER: Record<VisibleStatus, number> = {
  possible: 0,
  undated: 1,
  assigned: 2,
};

export function select(
  records: readonly HeritageRecord[],
  state: FilterState
): TimelineSelection {
  const base = filterBase(records, state);
  const assigned: HeritageRecord[] = [];
  const possible: HeritageRecord[] = [];
  const undated: HeritageRecord[] = [];
  for (const record of base) {
    const status = temporalStatus(record, state.year, state.mode);
    if (status === "assigned") assigned.push(record);
    if (status === "possible") possible.push(record);
    if (status === "undated") undated.push(record);
  }
  const visible: VisibleRecord[] = assigned.map((record) => ({
    record,
    status: "assigned",
  }));
  if (state.showUncertain) {
    visible.push(
      ...possible.map(
        (record): VisibleRecord => ({ record, status: "possible" })
      )
    );
    visible.push(
      ...undated.map((record): VisibleRecord => ({ record, status: "undated" }))
    );
  }
  visible.sort((a, b) => {
    if (a.status !== b.status) {
      return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    }
    return (
      a.record.municipality.localeCompare(b.record.municipality, "pt") ||
      a.record.location.localeCompare(b.record.location, "pt") ||
      a.record.id.localeCompare(b.record.id)
    );
  });
  return { base, assigned, possible, undated, visible };
}

export function series(
  records: readonly HeritageRecord[],
  state: FilterState
): TimelineSeriesPoint[] {
  return YEARS.map((year) => {
    const selection = select(records, { ...state, year });
    return {
      year,
      assigned: selection.assigned.length,
      possible: selection.possible.length,
      undated: selection.undated.length,
    };
  });
}

export function groupMunicipalities(
  visible: readonly VisibleRecord[]
): MunicipalityGroup[] {
  const groups = new Map<string, MunicipalityGroup>();
  for (const { record, status } of visible) {
    if (!record.municipalityId) continue;
    let group = groups.get(record.municipalityId);
    if (!group) {
      group = {
        id: record.municipalityId,
        name: record.municipality,
        assigned: 0,
        possible: 0,
        ids: [],
      };
      groups.set(record.municipalityId, group);
    }
    group[status === "assigned" ? "assigned" : "possible"]++;
    group.ids.push(record.id);
  }
  return Array.from(groups.values());
}
