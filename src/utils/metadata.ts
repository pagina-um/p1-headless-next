// lib/metadata.ts
import { Metadata } from "next";

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
    url: "https://paginaum.pt",
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
