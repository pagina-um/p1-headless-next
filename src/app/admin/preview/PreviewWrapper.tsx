"use client";

import { useGrid } from "@/components/ui/GridContext";
import { NewsGridClient } from "@/components/grid/NewsGridClient";
import { Loader } from "lucide-react";

export function PreviewWrapper() {
  const { gridState } = useGrid();

  if (!gridState || !gridState.blocks || gridState.blocks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh] text-gray-500">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return <NewsGridClient blocks={gridState.blocks} />;
}
