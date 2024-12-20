"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { NewsGrid } from "@/components/news/NewsGrid";
import { useGridState } from "@/hooks/useGridState";

export default function AdminPage() {
  const {
    gridConfig,
    categoryBlocks,
    staticBlocks,
    handleSaveLayout,
    hasTriedToLoad,
  } = useGridState();
  return (
    <main className="max-w-7xl mx-auto pb-8">
      {hasTriedToLoad && (
        <NewsGrid
          categoryBlocks={categoryBlocks}
          staticBlocks={staticBlocks}
          stories={gridConfig.stories}
        />
      )}
    </main>
  );
}
