import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import "@/styles/globals.css";
import { PostFooter } from "@/components/post/PostFooter";

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
        <Header />
        {children}
      </body>
    </html>
  );
}
