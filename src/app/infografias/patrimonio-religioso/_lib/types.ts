export type Universe = "igrejas" | "cemiterios";
export type TimelineMode = "period" | "cumulative";
export type RegionId = "continente" | "acores" | "madeira";
export type RegionFilter = RegionId | "all";

export type CategoryId =
  | "bens"
  | "tentativa"
  | "danos"
  | "pessoas"
  | "resultado_incerto"
  | "outros"
  | "cem_danos"
  | "cem_furto"
  | "cem_anterior";

export type TemporalPrecision =
  | "dia"
  | "mês"
  | "ano"
  | "intervalo"
  | "aproximado"
  | "incerto";

export type TemporalGranularity = "dia" | "mês" | "ano" | "intervalo";

export type DateRole =
  | "facto"
  | "intervalo_do_facto"
  | "descoberta_ou_alerta"
  | "descoberta_ou_denuncia"
  | "publicacao_ou_comunicacao"
  | "intervencao_policial"
  | "periodo_da_serie"
  | "referencia_retrospectiva"
  | "intervalo_incerto";

export interface HeritageSource {
  url: string;
  title: string;
  publishedDate: string | null;
  isPrimary: boolean;
}

/** The approved editorial record, before cartographic enrichment. */
export interface RawHeritageRecord {
  id: string;
  universe: Universe;
  siteId: string | null;
  location: string;
  municipality: string;
  district: string;
  description: string;
  categoryId: CategoryId;
  categoryLabel: string;
  originalType: string;
  isSeries: boolean;
  isAggregate: boolean;
  dateOriginal: string;
  dateDisplay: string;
  yearStart: number | null;
  yearEnd: number | null;
  isCrossYear: boolean;
  yearIsApproximate: boolean;
  temporalPrecision: TemporalPrecision;
  temporalGranularity: TemporalGranularity;
  temporalIsApproximate: boolean;
  temporalIsDisputed: boolean;
  dateRole: DateRole;
  dateRoleLabel: string;
  precisionNote: string;
  eventDateStart: string | null;
  eventDateEnd: string | null;
  referenceDate: string | null;
  referenceDateEnd: string | null;
  referenceDateBasis: string | null;
  publishedDate: string | null;
  sourceTitle: string;
  sourceUrl: string;
  sources: HeritageSource[];
  verificationNotes: string | null;
  damagesOriginal: string;
  damageDetail: string | null;
  authorities: string | null;
  followUp: string | null;
  motivation: string;
  motivationBasis: string | null;
}

export interface HeritageRecord extends RawHeritageRecord {
  municipalityId: string | null;
  mapRegion: RegionId | null;
}

export interface HeritageCategory {
  id: CategoryId;
  label: string;
  definition: string;
  count: number;
}

export type HeritageCategories = Record<Universe, HeritageCategory[]>;

export interface HeritageMetadata {
  dataCutoff: string;
  sourceWorkbook: string;
  recordCount: number;
  countsByUniverse: Record<Universe, number>;
  cemeterySiteCount: number;
}

/** WGS84 longitude, latitude; never an exact incident location. */
export type Position = [number, number];
export type BoundingBox = [number, number, number, number];

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Position[][];
}

export interface MultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export type Geometry = PolygonGeometry | MultiPolygonGeometry;

export interface GeographyMunicipality {
  id: string;
  name: string;
  region: RegionId;
  district: string;
  aliases: string[];
  geometry: Geometry;
  anchor: Position;
  precision: "municipality";
}

export interface GeographyRegion {
  id: RegionId;
  name: string;
  geometry: Geometry;
  bbox: BoundingBox;
  scaleNote: string;
}

export interface GeographySource {
  id: string;
  url: string;
  retrievedDate: string;
  features: number;
}

export interface GeographyProvenance {
  provider: string;
  title: string;
  serviceUrl: string;
  sources: GeographySource[];
  idMethod: string;
  islandMethod: string;
  anchorMethod: string;
  generalisation: string;
  scale: string;
  versionLimit: string;
  anchorExceptions: Record<string, string>;
  backgroundGeneralisation: string;
}

export interface GeographyValidation {
  municipalities: number;
  municipalitiesWithRecords: number;
  recordsMapped: number;
  churchRecords: number;
  cemeteryRecords: number;
  unmatchedRecords: string[];
  allAnchorsInsideOriginalAndDisplayGeometry: boolean;
  anchorMethods: Record<string, number>;
}

export interface Geography {
  schemaVersion: string;
  crs: string;
  precisionLabel: string;
  regions: GeographyRegion[];
  municipalities: GeographyMunicipality[];
  recordMunicipality: Record<string, string>;
  provenance: GeographyProvenance;
  validation: GeographyValidation;
}

export interface MunicipalityGroup {
  id: string;
  name: string;
  assigned: number;
  possible: number;
  ids: string[];
}

export interface FilterState {
  universe: Universe;
  mode: TimelineMode;
  year: number;
  category: CategoryId | "all";
  region: RegionFilter;
  municipality: string | null;
  query: string;
  showUncertain: boolean;
}

export type TemporalStatus = "assigned" | "possible" | "undated" | "outside";
export type VisibleStatus = Exclude<TemporalStatus, "outside">;

export interface VisibleRecord {
  record: HeritageRecord;
  status: VisibleStatus;
}

export interface TimelineSelection {
  base: HeritageRecord[];
  assigned: HeritageRecord[];
  possible: HeritageRecord[];
  undated: HeritageRecord[];
  visible: VisibleRecord[];
}

export interface TimelineSeriesPoint {
  year: number;
  assigned: number;
  possible: number;
  undated: number;
}

export interface InfographicData {
  records: HeritageRecord[];
  geography: Geography;
  categories: HeritageCategories;
  metadata: HeritageMetadata;
}
