import { createHash } from "crypto";
import churches from "../data/igrejas.json";
import cemeteries from "../data/cemiterios.json";
import municipalities from "../data/concelhos.json";
import geography from "../data/geografia.json";
import metadata from "../data/metadados.json";
import categories from "../data/tipologias.json";
import { getInfographicData } from "./data";

jest.mock("server-only", () => ({}), { virtual: true });

function canonicalJSON(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(canonicalJSON).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const object = value as Record<string, unknown>;
    return `{${Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJSON(object[key])}`)
      .join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) throw new Error("Unexpected non-JSON value");
  return encoded;
}

function sha256(value: unknown): string {
  return createHash("sha256")
    .update(canonicalJSON(value), "utf8")
    .digest("hex");
}

// These digests were calculated from the complete approved p1-data and
// p1-geography JSON embedded in PR #89, before splitting the native files.
// Object-key order and indentation are ignored; every value, array element,
// coordinate, source URL and record field remains covered by the comparison.
const APPROVED_DATA_SHA256 =
  "a9c16ac1f097c0b01875c9a5d477e6d3f187682bf3dab33aadd38939de860fbe";
const APPROVED_GEOGRAPHY_SHA256 =
  "57b060815252fef553f0af6925fbe2a9008bdd2ef8c0c3831497f9ee13a83163";

describe("approved heritage data preservation", () => {
  it("reconstructs the entire approved editorial data without changing values", () => {
    expect(
      sha256({ metadata, categories, records: [...churches, ...cemeteries] })
    ).toBe(APPROVED_DATA_SHA256);
  });

  it("reconstructs all approved geography, associations and provenance", () => {
    expect(sha256({ ...geography, municipalities })).toBe(
      APPROVED_GEOGRAPHY_SHA256
    );
  });

  it("adds only the existing municipality and region associations on the server", () => {
    const loaded = getInfographicData();
    const raw = [...churches, ...cemeteries];
    const municipalityIndex = new Map(municipalities.map((m) => [m.id, m]));

    expect(loaded.records).toHaveLength(206);
    expect(new Set(loaded.records.map((r) => r.id)).size).toBe(206);
    expect(loaded.records.filter((r) => r.universe === "igrejas")).toHaveLength(
      123
    );
    expect(
      loaded.records.filter((r) => r.universe === "cemiterios")
    ).toHaveLength(83);
    expect(loaded.geography.municipalities).toHaveLength(308);

    loaded.records.forEach((record, index) => {
      const { municipalityId, mapRegion, ...editorial } = record;
      expect(editorial).toEqual(raw[index]);
      expect(municipalityId).toBe(
        loaded.geography.recordMunicipality[record.id]
      );
      expect(mapRegion).toBe(municipalityIndex.get(municipalityId!)?.region);
      expect(record.sources.length).toBeGreaterThan(0);
    });
    expect(new Set(loaded.records.map((r) => r.municipalityId)).size).toBe(86);
  });

  it("keeps the actual serialized client payload below one megabyte", () => {
    expect(
      Buffer.byteLength(JSON.stringify(getInfographicData()), "utf8")
    ).toBeLessThan(1_000_000);
  });
});
