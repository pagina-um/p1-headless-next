/**
 * The part of a story's registry entry that is plain data: safe to send to
 * the browser (the admin grid needs it) and to turn into the shape the story
 * card layouts expect. The registry itself stays server-only because it
 * imports the story bodies.
 */
export interface HistoriaMeta {
  /** Segmento final do URL. Minúsculas sem acentos, números e hífens. */
  slug: string;
  title: string;
  /** A etiqueta por cima do título ("Investigação", "Análise", "Opinião"). */
  antetitulo: string;
  /** Uma ou duas frases para partilhas, metadados e cartões na homepage. */
  lede: string;
  author: string;
  /** Data de publicação, AAAA-MM-DD. Define o URL. */
  publishedAt: string;
  /** Imagem de abertura, em public/historias/<slug>/. */
  cover?: {
    src: string;
    alt: string;
    credit?: string;
    width?: number;
    height?: number;
  };
}

/** "/2026/11/22/<slug>", a partir de publishedAt. */
export function historiaPath(h: HistoriaMeta): string {
  const [year, month, day] = h.publishedAt.split("-");
  return `/${year}/${month}/${day}/${h.slug}`;
}

/**
 * A story in the shape of a WordPress post, so the story block layouts
 * (classic, modern, all their options) render it without knowing the
 * difference. Fields the layouts never read are left empty.
 */
export function historiaToStoryPost(h: HistoriaMeta) {
  return {
    __typename: "Post" as const,
    id: `historia:${h.slug}`,
    title: h.title,
    content: "",
    databaseId: 0,
    uri: historiaPath(h),
    excerpt: h.lede,
    date: h.publishedAt,
    slug: h.slug,
    postFields: {
      antetitulo: h.antetitulo,
      chamadaDestaque: h.lede,
      chamadaManchete: null,
    },
    tags: { nodes: [] },
    categories: { nodes: [] },
    author: { node: { name: h.author, slug: null } },
    featuredImage: h.cover
      ? {
          node: {
            sourceUrl: h.cover.src,
            altText: h.cover.alt,
            srcSet: null,
            mediaDetails: {
              width: h.cover.width ?? 1200,
              height: h.cover.height ?? 675,
            },
          },
        }
      : null,
  };
}
