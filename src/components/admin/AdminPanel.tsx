"use client";
import React, { Suspense, useEffect, useState } from "react";
import {
  Save,
  Loader,
  Trash,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeIcon,
} from "lucide-react";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { GRID_COLUMNS } from "@/constants/blocks";
import { useGrid } from "@/components/ui/GridContext";
import { RotateCcw } from "lucide-react";
import Link from "next/link";

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    handleCreateCategoryBlock,
    gridState,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleSave,
    setShowToast,
    showToast,
    isSaving,
    handleClearLayout,
    handleResetChanges,
    hasUnsavedChanges,
  } = useGrid();

  const handleSaveWithConfirmation = () => {
    if (window.confirm("Tem certeza que deseja guardar o layout?")) {
      handleSave();
    }
  };

  const handleClearWithConfirmation = () => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar o layout? Esta ação não pode ser desfeita."
      )
    ) {
      handleClearLayout();
    }
  };

  return (
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
              onClick={handleClearWithConfirmation}
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
              className="bg-gray-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleResetChanges}
            >
              <RotateCcw className="w-4 h-4" />
              Anular Alterações
            </button>
            <Link
              href="/admin/preview"
              className="bg-gray-600 w-40 h-10 text-white px-4 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" /> Pré-visualizar
            </Link>
            <button
              disabled={isSaving || !hasUnsavedChanges}
              className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              onClick={handleSaveWithConfirmation}
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

      <Suspense fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}>
        {gridState && <EditableGrid columns={GRID_COLUMNS} />}
      </Suspense>

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
