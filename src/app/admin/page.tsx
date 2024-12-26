"use client";

import { AdminPanel, placeHolder } from "@/components/admin/AdminPanel";
import { GQL_URL } from "@/services/wordpress";
import {
  UrqlProvider,
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
} from "@urql/next";
import { Suspense, useMemo } from "react";

export default function AdminPage() {
  const [client, ssr] = useMemo(() => {
    const ssr = ssrExchange({
      isClient: typeof window !== "undefined",
    });
    const client = createClient({
      url: GQL_URL,
      exchanges: [cacheExchange, ssr, fetchExchange],
      suspense: true,
    });

    return [client, ssr];
  }, []);

  return (
    <UrqlProvider client={client} ssr={ssr}>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Suspense fallback={<div>Loading...</div>}>
          <AdminPanel />
        </Suspense>
      </main>
    </UrqlProvider>
  );
}

// TODO: any nav away from this page should prompt the user to save their changes
