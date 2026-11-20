import casesJSON from "../data/casos.json";
import documentsJSON from "../data/documentos.json";
import partiesJSON from "../data/partidos.json";
import peopleJSON from "../data/pessoas.json";
import manifestJSON from "../data/manifesto.json";
import type { CaseRecord, Party, Person } from "./types";
import { buildIndex, summaryRows } from "./archive";

// Import this module only in server pages and the download route.
export const cases = casesJSON as CaseRecord[];
export const documents = documentsJSON as CaseRecord[];
export const records = [...cases, ...documents];
export const parties = partiesJSON as Party[];
export const people = peopleJSON as Person[];
export const manifest = manifestJSON;
export const index = buildIndex(records, parties);
export const rows = summaryRows(index, parties);
export const aliases: Record<string, string> = manifest.caseAliases;
export function recordById(id: string) {
  return records.find((r) => r.id === (aliases[id] || id));
}
export function personById(id: string) {
  return people.find((p) => p.id === id);
}
