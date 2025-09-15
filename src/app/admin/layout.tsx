"use client";
import { GridProvider } from "@/components/ui/GridContext";
import { ADMIN_PASSWORD, ADMIN_USERNAME, WP_URL, WP_GRAPHQL_API_KEY, validateGraphQLConfig, validateAdminConfig } from "@/services/config";
import {
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
  UrqlProvider,
} from "@urql/next";

// Validate configuration in development
if (process.env.NODE_ENV === "development") {
  validateGraphQLConfig();
  validateAdminConfig();
}

// Move client creation outside component
const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

const client = createClient({
  url: (WP_URL + "graphql") as string,
  exchanges: [cacheExchange, ssr, fetchExchange],
  suspense: true,
  fetchOptions: () => {
    const headers: Record<string, string> = {};
    
    // Add API key authentication if available
    if (WP_GRAPHQL_API_KEY) {
      headers['X-WP-GraphQL-API-Key'] = WP_GRAPHQL_API_KEY;
    }
    
    // Add Basic Auth for admin operations
    if (ADMIN_USERNAME && ADMIN_PASSWORD) {
      headers['Authorization'] = `Basic ${Buffer.from(
        `${ADMIN_USERNAME}:${ADMIN_PASSWORD}`
      ).toString("base64")}`;
    }
    
    return {
      headers,
    };
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
