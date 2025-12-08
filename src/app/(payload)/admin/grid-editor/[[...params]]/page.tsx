"use client";

import { GridProvider } from "@/components/ui/GridContext";
import { EditableGrid } from "@/components/grid/EditableGrid";
import { GRID_COLUMNS } from "@/constants/blocks";
import { GridEditorToolbar } from "./components/GridEditorToolbar";
import { ContentPicker } from "./components/ContentPicker";
import { useEffect, useState } from "react";
import { GridState } from "@/types";
import "@/styles/globals.css";

interface PageProps {
  params: Promise<{ params?: string[] }>;
}

export default function GridEditorPage({ params }: PageProps) {
  const [layoutId, setLayoutId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      const id = resolvedParams?.params?.[0]; // 'new' or layoutId
      setLayoutId(id === "new" ? null : id || null);
      setIsLoading(false);
    }
    loadParams();
  }, [params]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading grid editor...</div>
      </div>
    );
  }

  return (
    <GridProvider layoutId={layoutId}>
      <div className="grid-editor-container min-h-screen bg-gray-50">
        <GridEditorToolbar layoutId={layoutId} />

        <div className="grid-editor-layout flex gap-4 p-4">
          {/* Left sidebar: Content picker */}
          <div className="content-picker-sidebar w-80 flex-shrink-0">
            <ContentPicker />
          </div>

          {/* Right side: Grid canvas */}
          <div className="grid-canvas flex-1 bg-white rounded-lg shadow-sm p-4">
            <EditableGrid columns={GRID_COLUMNS} />
          </div>
        </div>
      </div>
    </GridProvider>
  );
}
