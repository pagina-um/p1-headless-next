import React, { Suspense } from "react";
import { Settings, Save, Loader, Delete, Trash } from "lucide-react";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { useGrid } from "@/hooks/useGrid";
import { GRID_COLUMNS } from "@/constants/blocks";

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const {
    handleCreateCategoryBlock,
    gridState,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleUpdateCategoryBlock,
    handleDeleteBlock,
    handleLayoutChange,
    handleSave,
    setShowToast,
    showToast,
    isSaving,
    handleClearLayout,
  } = useGrid();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Painel de Administração
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
              disabled={isSaving}
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

      <Suspense fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}>
        {gridState && (
          <EditableGrid
            columns={GRID_COLUMNS}
            blocks={gridState.blocks}
            onLayoutChange={handleLayoutChange}
            onDeleteBlock={handleDeleteBlock}
            onUpdateCategoryBlock={handleUpdateCategoryBlock}
          />
        )}
      </Suspense>

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
