import type { ComponentType } from "react";
import { HistoriaMeta, historiaPath } from "./meta";

export type { HistoriaMeta } from "./meta";
export { historiaPath } from "./meta";

/**
 * Registo das histórias escritas neste repositório, sem WordPress.
 *
 * Uma história vive em `src/historias/<slug>/Historia.tsx` (o corpo, em
 * JSX) e é servida no mesmo endereço das notícias do WordPress,
 * /AAAA/MM/DD/<slug>, com o mesmo cabeçalho, tipografia, partilha e rodapé.
 * A rota das notícias consulta este registo antes de perguntar ao WordPress.
 *
 * Só código de servidor importa este ficheiro: `load` importa componentes de
 * servidor, que não podem ir para o browser.
 */
export interface Historia extends HistoriaMeta {
  load: () => Promise<{ default: ComponentType }>;
}

export const HISTORIAS: Historia[] = [
  // {
  //   slug: "exemplo",
  //   title: "Título da história",
  //   antetitulo: "Investigação",
  //   lede: "Uma frase que resume a história.",
  //   author: "Nome do autor",
  //   publishedAt: "2026-11-22",
  //   cover: { src: "/historias/exemplo/capa.jpg", alt: "..." },
  //   load: () => import("./exemplo/Historia"),
  // },
];

export function getHistoria(slug: string): Historia | null {
  return HISTORIAS.find((h) => h.slug === slug) ?? null;
}

/** Mais recentes primeiro. */
export function historiasRecentes(limit = HISTORIAS.length): Historia[] {
  return HISTORIAS.slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, limit);
}

export function historiaParams(historia: Historia) {
  const [yearOrSlug, month, day] = historia.publishedAt.split("-");
  return { yearOrSlug, month, day, slug: historia.slug };
}

/** A entrada sem `load`, para passar ao browser (grelha do admin). */
export function toHistoriaMeta(h: Historia): HistoriaMeta {
  const { load, ...meta } = h;
  void load;
  return meta;
}

export function historiasMeta(): HistoriaMeta[] {
  return HISTORIAS.slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map(toHistoriaMeta);
}
