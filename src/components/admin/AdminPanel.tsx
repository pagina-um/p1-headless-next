"use client";
import React, { Suspense, useEffect, useState } from "react";
import { Save, Loader, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { useGrid } from "@/hooks/useGrid";
import { GRID_COLUMNS } from "@/constants/blocks";
import {
  ssrExchange,
  cacheExchange,
  fetchExchange,
  createClient,
  UrqlProvider,
} from "@urql/next";

// Move client creation outside component
const ssr = ssrExchange({
  isClient: typeof window !== "undefined",
});

const client = createClient({
  url: process.env.NEXT_PUBLIC_GQL_URL as string,
  exchanges: [cacheExchange, ssr, fetchExchange],
  suspense: true,
  fetchOptions: {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_HOST_USER}:${process.env.NEXT_PUBLIC_HOST_PASS}`
      ).toString("base64")}`,
    },
  },
});

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    handleCreateCategoryBlock,
    gridState,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleUpdateBlockSettings,
    handleDeleteBlock,
    handleLayoutChange,
    handleSave,
    setShowToast,
    showToast,
    isSaving,
    handleClearLayout,
    hasUnsavedChanges,
  } = useGrid();

  return (
    <UrqlProvider client={client} ssr={ssr}>
      <div className="space-y-6 relative">
        <div className="bg-white shadow-lg p-6 ">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <button onClick={() => setIsExpanded(!isExpanded)}>
                {!isExpanded ? (
                  <ChevronDown className="w-6 h-6" />
                ) : (
                  <ChevronUp className="w-6 h-6" />
                )}
              </button>
              Adicionar conteúdo
            </h1>
            <div className="flex gap-4">
              <button
                disabled={isSaving}
                className="bg-red-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleClearLayout}
              >
                {!isSaving ? (
                  <Trash className="w-4 h-4" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Apagar Layout
              </button>
              <button
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleSave}
              >
                {!isSaving ? (
                  <Save className="w-4 h-4" />
                ) : (
                  <Loader className="w-4 h-4 animate-spin" />
                )}
                Guardar Layout
              </button>
            </div>
          </div>

          <div
            className="absolute z-10 bg-white shadow-lg p-6 w-full top-20 left-0"
            style={{ display: isExpanded ? "block" : "none" }}
          >
            {" "}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <BlocksTabs
                  onCreateCategoryBlock={handleCreateCategoryBlock}
                  onCreateStaticBlock={handleCreateStaticBlock}
                />
              </div>

              <StoriesList onSelectPost={handleCreateStoryBlock} />
            </div>
          </div>
        </div>

        <Suspense
          fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}
        >
          {gridState && (
            <EditableGrid
              columns={GRID_COLUMNS}
              blocks={gridState.blocks}
              onLayoutChange={handleLayoutChange}
              onDeleteBlock={handleDeleteBlock}
              onUpdateBlockSettings={handleUpdateBlockSettings}
            />
          )}
        </Suspense>

        <Toast
          show={showToast}
          message="Layout guardado com sucesso!"
          onClose={() => setShowToast(false)}
        />
      </div>
    </UrqlProvider>
  );
}
