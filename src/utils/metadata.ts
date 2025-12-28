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
  description: "O jornalismo independente só depende dos leitores.",
  openGraph: {
    type: "website",
    locale: "pt_PT",
    url: "https://paginaum.pt",
    siteName: "Página UM",
    images: [
      {
        url: "https://paginaum.pt/icon.png",
        width: 512,
        height: 512,
        alt: "Página UM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "https://paginaum.pt",
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

const DEFAULT_OG_IMAGE = {
  url: "https://paginaum.pt/icon.png",
  width: 512,
  height: 512,
  alt: "Página UM",
};

export const makeMetadataObject = (
  data: PostBySlugData["data"],
  year: string,
  month: string,
  day: string,
  slug: string
) => {
  const { title, author, modified, date, featuredImage, postFields } =
    data?.postBy || {};

  const { antetitulo, chamadaDestaque, chamadaManchete } =
    postFields as CustomPostFields;

  const ogImage = featuredImage?.node?.sourceUrl
    ? {
        url: featuredImage.node.sourceUrl,
        width: 1200,
        height: 630,
        alt: featuredImage.node.altText || title || "Página Um",
      }
    : DEFAULT_OG_IMAGE;

  return {
    title: data?.postBy?.title || "Página Um",
    description:
      chamadaDestaque ||
      chamadaManchete ||
      "O jornalismo independente só depende dos leitores.",
    openGraph: {
      title: title || "Página Um",
      description:
        chamadaDestaque ||
        chamadaManchete ||
        "O jornalismo independente só depende dos leitores.",
      type: "article",
      publishedTime: date || new Date().toISOString(),
      modifiedTime: modified || new Date().toISOString(),
      authors: author?.node?.name ? [author.node.name] : undefined,
      images: [ogImage],
      url: `https://paginaum.pt/${year}/${month}/${day}/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title || "Página Um",
      description:
        chamadaDestaque ||
        chamadaManchete ||
        "O jornalismo independente só depende dos leitores.",
      images: [ogImage.url],
    },
    // Add schema.org structured data
    alternates: {
      canonical: `https://paginaum.pt/${year}/${month}/${day}/${slug}`,
    },
  };
};
