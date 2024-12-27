import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { GRID_COLUMNS } from "../../constants/grid";
import { useGrid } from "@/hooks/useGrid";

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const [showToast, setShowToast] = useState(false);

  const {
    handleCreateCategoryBlock,
    gridState,
    handleCreateStaticBlock,
    handleCreateStoryBlock,
    handleDeleteBlock,
    handleLayoutChange,
    handleSave,
  } = useGrid();

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Painel de Administração
          </h1>
          <button
            className="bg-blue-600 text-white px-4 py-2 flex items-center gap-2 hover:bg-blue-700 transition-colors"
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            Guardar Layout
          </button>
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

      {gridState && (
        <EditableGrid
          columns={GRID_COLUMNS}
          blocks={gridState.blocks}
          onLayoutChange={handleLayoutChange}
          onDeleteBlock={handleDeleteBlock}
        />
      )}

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
