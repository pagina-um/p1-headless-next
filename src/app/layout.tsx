import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";
import CookieConsent from "@/components/CookieConsent";
import NextTopLoader from "nextjs-toploader";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Página UM",
  description: "O Jornalismo independente só depende dos leitores.",
  robots: {
    // TODO: remove when going live
    index: false,
    follow: false,
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
  const activateGA = false; // TODO: remove when going live
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-100">
        {process.env.GOOGLE_ANALYTICS_ID && activateGA && (
          <GoogleAnalytics gaId={process.env.GOOGLE_ANALYTICS_ID} />
        )}
        <NextTopLoader color="#e10012" shadow={false} showSpinner={false} />
        <Header />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
