import { NewsGrid } from "@/components/grid/NewsGrid";
import { GridState } from "@/types";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";
import { loadGridStateLocal } from "@/services/local-storage";
import { loadGridStateRedis } from "@/services/redis";
import { isDevelopment } from "@/services/config";
import { Header } from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Cultura | Página UM",
  description: "Cultura - O jornalismo independente só depende dos leitores.",
};

// Safety net, not the primary refresh path — see src/app/page.tsx.
export const revalidate = 300;

// Errors deliberately propagate: catching them here renders a "Failed to load
// content" page that Next.js caches as a valid render and serves until the next
// manual purge. Letting the render fail keeps the last good page in cache.
async function getInitialState(): Promise<GridState | null> {
  if (isDevelopment) {
    return await loadGridStateLocal("grid-state-cultura.json");
  }
  return await loadGridStateRedis("grid-state-cultura", "cultura-grid");
}

export default async function CulturaPage() {
  const initialState = await getInitialState();
  if (!initialState) {
    return (
      <main className="max-w-7xl mx-auto pb-8">
        <div className="p-8 text-center text-gray-500">
          <p>Failed to load content. Please try again later.</p>
        </div>
      </main>
    );
  }
  return (
    <>
      <Header section="Cultura" accentColor="#f5f0e8" />
      <main className="max-w-7xl mx-auto pb-8">
        <NewsGrid blocks={initialState.blocks} />
      </main>
      <PostFooter />
    </>
  );
}
