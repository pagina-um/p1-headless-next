import "server-only";

import churchesJSON from "../data/igrejas.json";
import cemeteriesJSON from "../data/cemiterios.json";
import municipalitiesJSON from "../data/concelhos.json";
import geographyJSON from "../data/geografia.json";
import metadataJSON from "../data/metadados.json";
import categoriesJSON from "../data/tipologias.json";
import type {
  Geography,
  GeographyMunicipality,
  HeritageCategories,
  HeritageMetadata,
  HeritageRecord,
  InfographicData,
  RawHeritageRecord,
} from "./types";

const geography: Geography = {
  // JSON imports widen coordinate tuples to number[]; preservation tests cover
  // the complete approved geometry at this static data boundary.
  ...(geographyJSON as unknown as Omit<Geography, "municipalities">),
  municipalities: municipalitiesJSON as GeographyMunicipality[],
};

const municipalityIndex = new Map(
  geography.municipalities.map((municipality) => [
    municipality.id,
    municipality,
  ])
);

const rawRecords = [
  ...(churchesJSON as RawHeritageRecord[]),
  ...(cemeteriesJSON as RawHeritageRecord[]),
];

// Enrich copies; the approved editorial JSON remains unchanged. Region IDs are
// UI filter keys. The original geographic names remain in the geography data.
const records: HeritageRecord[] = rawRecords.map((record) => {
  const municipalityId = geography.recordMunicipality[record.id] || null;
  const municipality = municipalityId
    ? municipalityIndex.get(municipalityId)
    : undefined;
  return {
    ...record,
    municipalityId,
    mapRegion: municipality?.region ?? null,
  };
});

const infographicData: InfographicData = {
  records,
  geography,
  categories: categoriesJSON as HeritageCategories,
  metadata: metadataJSON as HeritageMetadata,
};

/** Shared by the full page and embed server routes; no browser fetch is needed. */
export function getInfographicData(): InfographicData {
  return infographicData;
}
