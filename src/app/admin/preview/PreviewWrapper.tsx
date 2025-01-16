"use client";

import { useGrid } from "@/components/ui/GridContext";
import { NewsGridClient } from "@/components/grid/NewsGridClient";

export function PreviewWrapper() {
  const { gridState } = useGrid();

  if (!gridState?.blocks) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-500">
        Loading preview...
      </div>
    );
  }

  return <NewsGridClient blocks={gridState.blocks} />;
}
