"use client";

import { AdminPanel } from "@/components/admin/AdminPanel";
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
    <main className="max-w-7xl mx-auto px-4 py-8">
      {hasTriedToLoad && (
        <AdminPanel
          initialConfig={gridConfig}
          initialCategoryBlocks={categoryBlocks}
          initialStaticBlocks={staticBlocks}
          onSaveLayout={handleSaveLayout}
        />
      )}
    </main>
  );
}
