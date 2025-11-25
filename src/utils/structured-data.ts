import { PostBySlugData } from "@/app/(frontend)/[yearOrSlug]/[month]/[day]/[slug]/page";

export interface NewsArticleSchema {
  "@context": "https://schema.org";
  "@type": "NewsArticle";
  headline: string;
  image?: string[];
  datePublished: string;
  dateModified: string;
  author: {
    "@type": "Person";
    name: string;
  }[];
  publisher: {
    "@type": "Organization";
    name: string;
    logo: {
      "@type": "ImageObject";
      url: string;
    };
  };
  description?: string;
  articleSection?: string;
  keywords?: string[];
  mainEntityOfPage: {
    "@type": "WebPage";
    "@id": string;
  };
}

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
  sameAs: string[];
}

export interface WebSiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  potentialAction: {
    "@type": "SearchAction";
    target: {
      "@type": "EntryPoint";
      urlTemplate: string;
    };
    "query-input": string;
  };
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
}

/**
 * Generate NewsArticle schema for post pages
 */
export function generateNewsArticleSchema(
  data: PostBySlugData["data"],
  url: string
): NewsArticleSchema {
  const post = data?.postBy;
  if (!post) {
    throw new Error("Post data is required for NewsArticle schema");
  }

  const categories = post.categories?.nodes || [];
  const tags = post.tags?.nodes || [];
  const authorName = post.author?.node?.name || "Página Um";

  const schema: NewsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title || "",
    datePublished: post.date || new Date().toISOString(),
    dateModified: post.modified || post.date || new Date().toISOString(),
    author: [
      {
        "@type": "Person",
        name: authorName,
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "Página Um",
      logo: {
        "@type": "ImageObject",
        url: "https://paginaum.pt/icon.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  // Add image if available
  if (post.featuredImage?.node?.sourceUrl) {
    schema.image = [post.featuredImage.node.sourceUrl];
  }

  // Add description
  const postFields = post.postFields as any;
  if (postFields?.chamadaDestaque) {
    schema.description = postFields.chamadaDestaque;
  }

  // Add article section (first category)
  if (categories.length > 0 && categories[0].name) {
    schema.articleSection = categories[0].name;
  }

  // Add keywords (tags + categories)
  const keywords = [
    ...tags.map((tag: any) => tag.name).filter(Boolean),
    ...categories.map((cat: any) => cat.name).filter(Boolean),
  ].filter((k): k is string => k !== null && k !== undefined);

  if (keywords.length > 0) {
    schema.keywords = keywords;
  }

  return schema;
}

/**
 * Generate Organization schema for root layout
 */
export function generateOrganizationSchema(): OrganizationSchema {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Página Um",
    url: "https://paginaum.pt",
    logo: "https://paginaum.pt/icon.png",
    sameAs: [
      "https://twitter.com/PAG_UM",
      "https://www.facebook.com/paginaum",
    ],
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): WebSiteSchema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Página Um",
    url: "https://paginaum.pt",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://paginaum.pt/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate BreadcrumbList schema for post pages
 */
export function generateBreadcrumbSchema(
  categoryName: string | null,
  postTitle: string,
  categorySlug?: string
): BreadcrumbListSchema {
  const items: BreadcrumbListSchema["itemListElement"] = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: "https://paginaum.pt",
    },
  ];

  if (categoryName && categorySlug) {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: categoryName,
      item: `https://paginaum.pt/cat/${categorySlug}`,
    });
    items.push({
      "@type": "ListItem",
      position: 3,
      name: postTitle,
    });
  } else {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: postTitle,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}
