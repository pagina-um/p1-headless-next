/**
 * Onde cada projecto especial é promovido no site. Os projectos em si estão em
 * `src/projectos/registry.ts`; este ficheiro só escolhe qual aparece onde.
 *
 * - `banner`: a faixa colorida no topo de todas as páginas, logo abaixo do
 *   cabeçalho. `null` esconde-a.
 * - `blocoHomepage`: o projecto mostrado pelo bloco estático "Projecto em
 *   destaque" da grelha da homepage. O bloco só aparece depois de alguém o
 *   adicionar à grelha em /admin.
 */

export interface BannerNote {
  before?: string;
  linkText: string;
  href: string;
  after?: string;
}

export interface BannerConfig {
  /** slug em PROJECTOS */
  projecto: string;
  /** Texto antes do botão com o nome do projecto, por exemplo "Experimente o". */
  lead: string;
  /** Frase secundária, só em ecrãs largos. Opcional. */
  note?: BannerNote;
}

export const DESTAQUES: {
  banner: BannerConfig | null;
  blocoHomepage: { projecto: string };
} = {
  banner: {
    projecto: "corpus",
    lead: "Experimente o",
    note: {
      before: "Obrigado aos leitores que apoiaram a",
      linkText: "longa batalha judicial",
      href: "https://paginaum.pt/2025/11/18/38-486-636-registos-de-internamentos-hospitalares",
      after: "que lhe deu origem.",
    },
  },
  blocoHomepage: { projecto: "corpus" },
};
