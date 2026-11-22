import type { ComponentType } from "react";

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
export interface Historia {
  /** Segmento final do URL. Minúsculas sem acentos, números e hífens. */
  slug: string;
  title: string;
  /** A etiqueta por cima do título ("Investigação", "Análise", "Opinião"). */
  antetitulo: string;
  /** Uma ou duas frases para partilhas, metadados e o bloco da homepage. */
  lede: string;
  author: string;
  /** Data de publicação, AAAA-MM-DD. Define o URL. */
  publishedAt: string;
  /** Imagem de abertura, em public/historias/<slug>/. */
  cover?: { src: string; alt: string; credit?: string };
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

/** "/2026/11/22/<slug>", a partir de publishedAt. */
export function historiaPath(historia: Historia): string {
  const [year, month, day] = historia.publishedAt.split("-");
  return `/${year}/${month}/${day}/${historia.slug}`;
}

export function historiaParams(historia: Historia) {
  const [yearOrSlug, month, day] = historia.publishedAt.split("-");
  return { yearOrSlug, month, day, slug: historia.slug };
}
