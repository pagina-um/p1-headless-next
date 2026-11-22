import type { ComponentType } from "react";

/**
 * Registo das infografias: peças interactivas que pertencem a uma notícia.
 *
 * Cada entrada liga um slug ao componente que a desenha. O artigo no
 * WordPress inclui um bloco HTML com `<div data-infografia="<slug>"></div>`
 * e o parser (src/utils/wpParsing.ts) substitui-o por esse componente, no
 * meio do texto. A mesma peça tem uma página própria em
 * /infografias/<slug>, construída em src/app/infografias/<slug>/page.tsx.
 *
 * O componente é importado de forma preguiçosa para que o código e os dados
 * de uma infografia só sejam carregados pelos artigos que a usam.
 */
export interface Infografia {
  /** Nome da peça, para acessibilidade e para a página própria. */
  title: string;
  load: () => Promise<{ default: ComponentType }>;
}

export const INFOGRAFIAS: Record<string, Infografia> = {
  "patrimonio-religioso": {
    title: "Património religioso atingido, 2022–2026",
    load: () => import("@/app/infografias/patrimonio-religioso/_components/Infografia"),
  },
};

export function getInfografia(slug: string): Infografia | null {
  return INFOGRAFIAS[slug] ?? null;
}
