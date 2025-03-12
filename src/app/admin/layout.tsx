"use client";
import { GridProvider } from "@/components/ui/GridContext";
import { ADMIN_PASSWORD, ADMIN_USERNAME, WP_URL } from "@/services/config";
import {
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
  UrqlProvider,
} from "@urql/next";

// Move client creation outside component
const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

const client = createClient({
  url: (WP_URL + "graphql") as string,
  exchanges: [cacheExchange, ssr, fetchExchange],
  suspense: true,
  fetchOptions: {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`
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
