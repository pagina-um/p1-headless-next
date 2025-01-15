// lib/metadata.ts
import {
  PostBySlugData,
  PostPageProps,
} from "@/app/[yearOrSlug]/[month]/[day]/[slug]/page";
import { CustomPostFields } from "@/types";
import { Metadata } from "next";

export interface SEOData {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

// Default metadata configuration
export const defaultMetadata: Metadata = {
  title: {
    default: "Página UM",
    template: "%s | Página UM",
  },
  description: "Your default site description",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://www.paginaum.pt",
    siteName: "Página UM",
    images: [
      {
        url: "/default-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Página UM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://www.paginaum.pt",
    creator: "@PAG_UM",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "Página Um",
  description: "O Jornalismo independente só depende dos leitores.",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "About Us",
    description: "O Jornalismo independente só depende dos leitores.",
  },
};

export const makeMetadataObject = (
  data: PostBySlugData["data"],
  params: PostPageProps["params"]
) => {
  const { title, author, modified, date, featuredImage, postFields } =
    data?.postBy || {};

  const { antetitulo, chamadaDestaque, chamadaManchete } =
    postFields as CustomPostFields;

  return {
    title: data?.postBy?.title || "Página Um",
    description:
      chamadaDestaque || "O jornalismo independente só depende dos leitores.",
    openGraph: {
      title: title || "Página Um",
      description:
        chamadaDestaque || "O jornalismo independente só depende dos leitores.",
      type: "article",
      publishedTime: date || new Date().toISOString(),
      modifiedTime: modified || new Date().toISOString(),
      authors: author?.node?.name ? [author.node.name] : undefined,
      images: featuredImage?.node?.sourceUrl
        ? [
            {
              url: featuredImage?.node?.sourceUrl,
              width: 1200,
              height: 630,
              alt: featuredImage?.node?.altText || title || "Página Um",
            },
          ]
        : undefined,
      url: `https://www.paginaum.pt/${params.yearOrSlug}/${params.month}/${params.day}/${params.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title || "Página Um",
      description: "excerpt",
      images: featuredImage?.node?.sourceUrl
        ? [featuredImage?.node?.sourceUrl]
        : undefined,
    },
    // Add schema.org structured data
    alternates: {
      canonical: `https://www.paginaum.pt/${params.yearOrSlug}/${params.month}/${params.day}/${params.slug}`,
    },
  };
};
