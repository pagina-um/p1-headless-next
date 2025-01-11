"use client";
import { GridProvider } from "@/components/ui/GridContext";
import {
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
  UrqlProvider,
} from "@urql/next";
import { Grid } from "lucide-react";

// Move client creation outside component
const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

const client = createClient({
  url: process.env.NEXT_PUBLIC_GQL_URL as string,
  exchanges: [cacheExchange, ssr, fetchExchange],
  suspense: true,
  fetchOptions: {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_HOST_USER}:${process.env.NEXT_PUBLIC_HOST_PASS}`
      ).toString("base64")}`,
    },
  },
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UrqlProvider client={client} ssr={ssr}>
      <GridProvider> {children}</GridProvider>
    </UrqlProvider>
  );
}
