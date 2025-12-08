// Schema.org type definitions for structured data

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
