import React, { useCallback, useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { StoriesList } from "./StoriesList";
import { BlocksTabs } from "./BlocksTabs";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { GRID_COLUMNS } from "../../constants/grid";
import { GridState } from "@/types";
import { Layout } from "react-grid-layout";

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  const [showToast, setShowToast] = useState(false);

  return (
    <div className="space-y-6">
      <div className="bg-white  shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Painel de Administração
          </h1>
          <button
            className="bg-blue-600 text-white px-4 py-2  flex items-center gap-2 hover:bg-blue-700 transition-colors"
            onClick={placeHolder}
          >
            <Save className="w-4 h-4" />
            Guardar Layout
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-6">
            <BlocksTabs
              onCreateCategoryBlock={placeHolder}
              onCreateStaticBlock={placeHolder}
            />
          </div>
          <StoriesList onSelectPost={placeHolder} />
        </div>
      </div>

      <EditableGrid
        columns={GRID_COLUMNS}
        blocks={[]}
        onLayoutChange={placeHolder}
        onDeleteBlock={placeHolder}
      />

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export function useGrid() {
  const [gridState, setGridState] = useState<GridState>();

  const handleLayoutChange = useCallback((layout: Layout[]) => {
    const positions = updateGridPositionFromLayout(layout);

    // Update stories

    // Update category blocks
    setCategoryBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        gridPosition: positions[block.id] || block.gridPosition,
      }))
    );

    // Update static blocks
    setStaticBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        gridPosition: positions[block.id] || block.gridPosition,
      }))
    );
  }, []);
}

export function placeHolder(): any {
  return () => {
    return;
  };
}
