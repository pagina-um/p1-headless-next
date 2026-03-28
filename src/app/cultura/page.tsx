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

async function getInitialState(): Promise<GridState | null> {
  try {
    if (isDevelopment) {
      return await loadGridStateLocal("grid-state-cultura.json");
    } else {
      const gridState = await loadGridStateRedis(
        "grid-state-cultura",
        "cultura-grid"
      );
      return gridState;
    }
  } catch (error) {
    console.error("Failed to load cultura grid state:", error);
    return null;
  }
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
