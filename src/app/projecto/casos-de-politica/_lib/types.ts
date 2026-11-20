export interface Source {
  label: string;
  href: string;
}
export interface Dated {
  date: string | null;
  dateLabel: string;
  datePrecision: "day" | "month" | "year" | null;
}
export interface ProceduralStatus {
  code: string;
  label: string;
  asOf: string;
  source: Source;
}
export interface Participant {
  id: string;
  name: string;
  fullName: string;
  role: string;
  proceduralStatus: ProceduralStatus | null;
}
export interface Evidence {
  person: string;
  party: string;
  description: string;
  period: string;
  source: Source;
}
export interface EntityCase {
  name: string;
  kind: string;
  type: string;
  municipality: string;
  people: string[];
  connection: string;
  entityEvidence: Evidence[];
  roleEvidence: Evidence[];
  membershipEvidence: Evidence[];
  politicalRoleEvidence: Evidence[];
}
export interface Mandate {
  jurisdiction: string;
  outcome: string;
  decisionDate: string | null;
  decisionDateLabel: string;
  finality: string;
  court: string;
  proceedings:
    | string
    | {
        applicant: string;
        caseNumber: string | null;
        outcome: string;
        decisionDate: string;
      }[];
  reason: string;
  scope: string;
  decisionSource: string;
}
export interface CaseRecord extends Dated {
  id: string;
  parties: string[];
  category: string;
  nature: string;
  phase: string;
  status: string;
  dateKind: string;
  year: number;
  title: string;
  summary: string;
  detail: string;
  affiliation: string;
  finality: string;
  penalty: string;
  amount: number | null;
  caseNumber: string;
  court: string;
  location: string;
  topic: string;
  procedureType: string;
  reference: string;
  sourceName: string;
  source: Source;
  checkedAt: string;
  researchBatch: string;
  related: string[];
  partyOutcomes: Record<string, string>;
  people: Participant[];
  timeline: (Dated & { text: string })[];
  sources: (Source & { kind: string })[];
  mandate: Mandate | null;
  entityCases: EntityCase[];
}
export interface Portrait {
  src: string;
  credit: string;
  license: string;
  source: Source | null;
  licenseUrl: string;
  position: number;
  approval: string;
}
export interface Person {
  id: string;
  name: string;
  fullNames: string[];
  recordIds: string[];
  source: Source;
  portrait: Portrait | null;
}
export interface Party {
  id: string;
  name: string;
  abbr: string;
  registered: string | null;
  historical: boolean;
  extinguished: string | null;
  source: Source;
  logo: {
    src: string;
    source: Source;
    original: string;
    author: string;
    license: string;
    licenseUrl: string;
    changes: string;
    checkedAt: string;
  } | null;
}
export interface CaseIndex extends Dated {
  id: string;
  title: string;
  summary: string;
  parties: string[];
  phase: string;
  nature: string;
  category: string;
  status: string;
  year: number;
  dateKind: string;
  location: string;
  caseNumber: string;
  partyOutcomes: Record<string, string>;
  people: { id: string; name: string }[];
  inquest: boolean;
  mandate: boolean;
  searchText: string;
}
export interface Filters {
  q: string;
  party: string;
  phase: string;
  nature: string;
  year: string;
  category: string;
  group: string;
  inquest: boolean;
  mandate: boolean;
  sort: string;
}
