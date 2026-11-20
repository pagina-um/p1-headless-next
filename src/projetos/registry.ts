import type { Metadata } from "next";

/**
 * Registo dos projetos especiais do Página UM.
 *
 * Um projeto especial é uma secção autónoma do site (um arquivo, um
 * observatório, uma base de dados) que vive em `src/app/projetos/<slug>/`.
 * Esta lista é a única fonte de verdade para o que aparece em
 * `/projetos`, no bloco da homepage e na faixa de destaque do topo
 * (ver `src/config/destaques.ts`).
 *
 * Projetos alojados fora do site (como o Corpus) entram aqui com `href`.
 */

export const PROJETO_ICONS = [
  "activity",
  "archive",
  "scale",
  "landmark",
  "gavel",
  "database",
  "map",
  "book-open",
  "users",
  "bar-chart",
  "file-search",
] as const;

export type ProjetoIconName = (typeof PROJETO_ICONS)[number];

export interface Projeto {
  /** Segmento do URL: /projetos/<slug>. Só letras minúsculas, números e hífens. */
  slug: string;
  /** Nome do projeto, tal como aparece no título da página. */
  title: string;
  /** Uma linha curta por baixo do nome (lema ou subtítulo). */
  kicker: string;
  /** Uma ou duas frases para cartões, metadados e partilhas. */
  description: string;
  icon: ProjetoIconName;
  /** Cor de destaque do projeto e a sua variante escura, em hexadecimal. */
  color: string;
  colorDark: string;
  /** Data de publicação, AAAA-MM-DD. */
  publishedAt: string;
  /** Quem assina o projeto, quando não é só o Página UM. */
  credits?: string;
  /** Projetos alojados fora do site. Quando ausente, o URL é /projetos/<slug>. */
  href?: string;
}

export const PROJETOS: Projeto[] = [
  {
    slug: "corpus",
    title: "Corpus",
    kicker: "Observatório de dados em saúde",
    description:
      "Registos de internamentos hospitalares em Portugal, abertos ao escrutínio público depois de uma longa batalha judicial.",
    icon: "activity",
    color: "#009588",
    colorDark: "#00786e",
    publishedAt: "2025-11-18",
    href: "https://corpus.paginaum.pt",
  },
];

export function getProjeto(slug: string): Projeto {
  const projeto = PROJETOS.find((p) => p.slug === slug);
  if (!projeto) {
    throw new Error(
      `Projeto "${slug}" não existe em src/projetos/registry.ts. Adicione-o à lista PROJETOS.`
    );
  }
  return projeto;
}

export function projetoHref(projeto: Projeto): string {
  return projeto.href ?? `/projetos/${projeto.slug}`;
}

/** Projetos alojados neste site, mais recentes primeiro. */
export function projetosInternos(): Projeto[] {
  return PROJETOS.filter((p) => !p.href).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

/** Metadados para `export const metadata` na página de um projeto. */
export function projetoMetadata(slug: string): Metadata {
  const projeto = getProjeto(slug);
  const title = `${projeto.title} | Página UM`;
  return {
    title,
    description: projeto.description,
    openGraph: {
      title,
      description: projeto.description,
      type: "website",
      locale: "pt_PT",
    },
  };
}
