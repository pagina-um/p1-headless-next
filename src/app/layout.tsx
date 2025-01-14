import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";
import CookieConsent from "@/components/CookieConsent";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "News Grid",
  description: "A modern news grid layout built with Next.js",
  robots: {
    // TODO: remove when going live
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gray-100">
        <NextTopLoader color="#e10012" shadow={false} showSpinner={false} />
        <Header />
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
