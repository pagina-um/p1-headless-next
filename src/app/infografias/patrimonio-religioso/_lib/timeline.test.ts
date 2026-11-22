import { getInfographicData } from "./data";
import {
  YEARS,
  filterBase,
  groupMunicipalities,
  normalise,
  select,
  series,
  temporalStatus,
} from "./timeline";
import type { FilterState } from "./types";

jest.mock("server-only", () => ({}), { virtual: true });

const { records } = getInfographicData();

function state(overrides: Partial<FilterState> = {}): FilterState {
  return {
    universe: "igrejas",
    mode: "period",
    year: 2022,
    category: "all",
    region: "all",
    municipality: null,
    query: "",
    showUncertain: true,
    ...overrides,
  };
}

function record(id: string) {
  const found = records.find((item) => item.id === id);
  if (!found) throw new Error(`Missing approved record ${id}`);
  return found;
}

describe("annual documentary attribution", () => {
  it.each([
    {
      universe: "igrejas" as const,
      period: [22, 27, 35, 19, 19],
      periodPossible: [0, 0, 1, 1, 0],
      cumulative: [22, 49, 84, 104, 123],
      cumulativePossible: [0, 0, 1, 0, 0],
    },
    {
      universe: "cemiterios" as const,
      period: [16, 15, 9, 32, 10],
      periodPossible: [0, 0, 0, 1, 1],
      cumulative: [16, 31, 40, 72, 83],
      cumulativePossible: [0, 0, 0, 1, 0],
    },
  ])("preserves annual and cumulative counts for $universe", (expected) => {
    const period = series(records, state({ universe: expected.universe }));
    const cumulative = series(
      records,
      state({ universe: expected.universe, mode: "cumulative" })
    );
    expect(period.map((point) => point.year)).toEqual(YEARS);
    expect(period.map((point) => point.assigned)).toEqual(expected.period);
    expect(period.map((point) => point.possible)).toEqual(
      expected.periodPossible
    );
    expect(cumulative.map((point) => point.assigned)).toEqual(
      expected.cumulative
    );
    expect(cumulative.map((point) => point.possible)).toEqual(
      expected.cumulativePossible
    );
    expect(period.every((point) => point.undated === 0)).toBe(true);
  });

  it.each([
    { id: "C024", first: 2024, last: 2025 },
    { id: "CEM-083", first: 2025, last: 2026 },
  ])("does not invent one year for $id", ({ id, first, last }) => {
    const item = record(id);
    expect(temporalStatus(item, first - 1, "period")).toBe("outside");
    expect(temporalStatus(item, first, "period")).toBe("possible");
    expect(temporalStatus(item, last, "period")).toBe("possible");
    expect(temporalStatus(item, first, "cumulative")).toBe("possible");
    expect(temporalStatus(item, last, "cumulative")).toBe("assigned");
    expect(item.isCrossYear).toBe(true);
    expect(item.eventDateStart).toBeNull();
  });

  it("preserves the approximate 2024 attribution for Bicas", () => {
    const bicas = record("CEM-033");
    expect([bicas.yearStart, bicas.yearEnd]).toEqual([2024, 2024]);
    expect(bicas.yearIsApproximate).toBe(true);
    expect(bicas.temporalIsApproximate).toBe(true);
    expect(bicas.temporalPrecision).toBe("aproximado");
    expect(bicas.eventDateStart).toBeNull();
    expect(bicas.referenceDate).toBe("2025-03-05");
    expect(temporalStatus(bicas, 2024, "period")).toBe("assigned");
    expect(temporalStatus(bicas, 2025, "period")).toBe("outside");
  });

  it("keeps discovery dates separate from event dates", () => {
    const alarme = record("SUL-031");
    expect(alarme.dateRole).toBe("descoberta_ou_alerta");
    expect(alarme.referenceDate).toBe("2024-03-07");
    expect(alarme.eventDateStart).toBeNull();
    expect(
      temporalStatus({ yearStart: null, yearEnd: null }, 2024, "period")
    ).toBe("undated");
  });

  it("hides uncertain records without silently changing the separate counts", () => {
    const shown = select(records, state({ year: 2024 }));
    const hidden = select(records, state({ year: 2024, showUncertain: false }));
    expect(shown.possible.map((item) => item.id)).toEqual(["C024"]);
    expect(hidden.possible.map((item) => item.id)).toEqual(["C024"]);
    expect(shown.visible).toHaveLength(36);
    expect(hidden.visible).toHaveLength(35);
    expect(shown.visible[0].status).toBe("possible");
    expect(new Set(shown.visible.map((item) => item.record.id)).size).toBe(36);
  });
});

describe("geographic and documentary filters", () => {
  it("uses region identifiers without mixing the three geographic panels", () => {
    expect(filterBase(records, state({ region: "continente" }))).toHaveLength(
      110
    );
    expect(filterBase(records, state({ region: "acores" }))).toHaveLength(8);
    expect(filterBase(records, state({ region: "madeira" }))).toHaveLength(5);
    expect(
      filterBase(records, state({ universe: "cemiterios", region: "madeira" }))
    ).toHaveLength(1);
  });

  it("preserves accent-insensitive, all-term searches and combined category filters", () => {
    expect(normalise("  SÃO VICENTE  ")).toBe("sao vicente");
    expect(
      filterBase(records, state({ query: "igreja   MUGE" })).map((r) => r.id)
    ).toEqual(["SUL-029", "SUL-030"]);
    expect(
      filterBase(records, state({ query: "igreja MUGE", category: "bens" }))
    ).toHaveLength(0);
    expect(filterBase(records, state({ query: "CEM-083" }))).toHaveLength(0);
  });

  it("keeps municipality counts separate from the uncertain records", () => {
    const selection = select(
      records,
      state({ year: 2024, municipality: "pt-0608" })
    );
    const groups = groupMunicipalities(selection.visible);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({
      id: "pt-0608",
      name: "Mira",
      assigned: 2,
      possible: 1,
    });
    expect(new Set(groups[0].ids)).toEqual(new Set(["C021", "C022", "C024"]));
  });
});
