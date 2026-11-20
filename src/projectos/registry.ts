import type { Metadata } from "next";

/**
 * Registo dos projectos especiais do Página UM.
 *
 * Um projecto especial é uma secção autónoma do site (um arquivo, um
 * observatório, uma base de dados) que vive em `src/app/projectos/<slug>/`.
 * Esta lista é a única fonte de verdade para o que aparece em
 * `/projectos`, no bloco da homepage e na faixa de destaque do topo
 * (ver `src/config/destaques.ts`).
 *
 * Projectos alojados fora do site (como o Corpus) entram aqui com `href`.
 */

export const PROJECTO_ICONS = [
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

export type ProjectoIconName = (typeof PROJECTO_ICONS)[number];

export interface Projecto {
  /** Segmento do URL: /projectos/<slug>. Só letras minúsculas, números e hífens. */
  slug: string;
  /** Nome do projecto, tal como aparece no título da página. */
  title: string;
  /** Uma linha curta por baixo do nome (lema ou subtítulo). */
  kicker: string;
  /** Uma ou duas frases para cartões, metadados e partilhas. */
  description: string;
  icon: ProjectoIconName;
  /** Cor de destaque do projecto e a sua variante escura, em hexadecimal. */
  color: string;
  colorDark: string;
  /** Data de publicação, AAAA-MM-DD. */
  publishedAt: string;
  /** Quem assina o projecto, quando não é só o Página UM. */
  credits?: string;
  /** Projectos alojados fora do site. Quando ausente, o URL é /projectos/<slug>. */
  href?: string;
}

export const PROJECTOS: Projecto[] = [
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

export function getProjecto(slug: string): Projecto {
  const projecto = PROJECTOS.find((p) => p.slug === slug);
  if (!projecto) {
    throw new Error(
      `Projecto "${slug}" não existe em src/projectos/registry.ts. Adicione-o à lista PROJECTOS.`
    );
  }
  return projecto;
}

export function projectoHref(projecto: Projecto): string {
  return projecto.href ?? `/projectos/${projecto.slug}`;
}

/** Projectos alojados neste site, mais recentes primeiro. */
export function projectosInternos(): Projecto[] {
  return PROJECTOS.filter((p) => !p.href).sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );
}

/** Metadados para `export const metadata` na página de um projecto. */
export function projectoMetadata(slug: string): Metadata {
  const projecto = getProjecto(slug);
  const title = `${projecto.title} | Página UM`;
  return {
    title,
    description: projecto.description,
    openGraph: {
      title,
      description: projecto.description,
      type: "website",
      locale: "pt_PT",
    },
  };
}
