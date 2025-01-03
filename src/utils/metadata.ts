// lib/metadata.ts
import { PostBySlugData } from "@/app/[year]/[month]/[day]/[slug]/page";
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
    default: "Your Site Name",
    template: "%s | Your Site Name",
  },
  description: "Your default site description",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yoursite.com",
    siteName: "Your Site Name",
    images: [
      {
        url: "/default-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Your Site Name",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@yourtwitterhandle",
    creator: "@yourtwitterhandle",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const metadata: Metadata = {
  ...defaultMetadata,
  title: "About Us",
  description: "Learn more about our company and mission",
  openGraph: {
    ...defaultMetadata.openGraph,
    title: "About Us",
    description: "Learn more about our company and mission",
  },
};

export const makeMetadataObject = (
  data: PostBySlugData,
  params: PostPageProps
) => ({
  title: data.postBy.title,
  description: "excerpt",
  openGraph: {
    title: data.postBy.title,
    description: "excerpt",
    type: "article",
    publishedTime: data.postBy.date || new Date().toISOString(),
    modifiedTime: data.postBy.modified || new Date().toISOString(),
    authors: data.postBy.author?.node?.name
      ? [data.postBy.author.node.name]
      : undefined,
    images: ogImage
      ? [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: data.postBy.title,
          },
        ]
      : undefined,
    url: `https://yoursite.com/${params.year}/${params.month}/${params.day}/${params.slug}`,
  },
  twitter: {
    card: "summary_large_image",
    title: data.postBy.title,
    description: "excerpt",
    images: ogImage ? [ogImage] : undefined,
  },
  // Add schema.org structured data
  alternates: {
    canonical: `https://yoursite.com/${params.year}/${params.month}/${params.day}/${params.slug}`,
  },
});
