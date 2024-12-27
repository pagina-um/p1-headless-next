"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { GQL_URL } from "@/services/wordpress";
import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
} from "@urql/next";
import { Suspense } from "react";

// Move client creation outside component
const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

const client = createClient({
  url: GQL_URL,
  exchanges: [cacheExchange, ssr, fetchExchange],
  suspense: true,
});

export default function AdminPage() {
  return (
    <UrqlProvider client={client} ssr={ssr}>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminPanel />
      </main>
    </UrqlProvider>
  );
}

// TODO: any nav away from this page should prompt the user to save their changes
