import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";
import CookieConsent from "@/components/CookieConsent";
import NextTopLoader from "nextjs-toploader";
import { twMerge } from "tailwind-merge";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  title: "Página UM",
  description: "O Jornalismo independente só depende dos leitores.",
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://paginaum.pt"),
  openGraph: {
    type: "website",
    locale: "pt_PT",
    images: [
      {
        url: new URL("/icon.png", "https://paginaum.pt").toString(),
        width: 512,
        height: 512,
        alt: "Página UM",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={twMerge("h-full")}>
      <body className="min-h-screen bg-gray-100">
        <Analytics />
        <NextTopLoader color="#e10012" shadow={false} showSpinner={false} />
        <Header />
        {children}
        {process.env.GOOGLE_ANALYTICS_ID && (
          <CookieConsent gaId={process.env.GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
