import React, { useState } from "react";
import { Settings, Save } from "lucide-react";
import { GridConfig, CategoryBlock, StaticBlock } from "../../types";
import { StoriesList } from "./StoriesList";
import { BlocksTabs } from "./BlocksTabs";
import { GridLayout } from "../grid/GridLayout";
import { Toast } from "../ui/Toast";
import { useGridLayout } from "../../hooks/useGridLayout";
import { GRID_COLUMNS } from "../../constants/grid";

interface AdminPanelProps {
  initialConfig: GridConfig;
  initialCategoryBlocks: CategoryBlock[];
  initialStaticBlocks: StaticBlock[];
  onSaveLayout: (
    config: GridConfig,
    categoryBlocks: CategoryBlock[],
    staticBlocks: StaticBlock[]
  ) => void;
}

export function AdminPanel({
  initialConfig,
  initialCategoryBlocks,
  initialStaticBlocks,
  onSaveLayout,
}: AdminPanelProps) {
  const [showToast, setShowToast] = useState(false);

  const {
    gridConfig,
    categoryBlocks,
    staticBlocks,
    handleLayoutChange,
    addStory,
    handleCreateCategoryBlock,
    handleCreateStaticBlock,
    handleDeleteStory,
    handleDeleteCategoryBlock,
    handleDeleteStaticBlock,
    handleUpdateCategoryBlock,
  } = useGridLayout(initialConfig, initialCategoryBlocks, initialStaticBlocks);

  const handleSave = () => {
    onSaveLayout(gridConfig, categoryBlocks, staticBlocks);
    setShowToast(true);
  };

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
          <StoriesList onSelectPost={addStory} />
        </div>
      </div>

      <GridLayout
        columns={GRID_COLUMNS}
        stories={gridConfig.stories}
        categoryBlocks={categoryBlocks}
        staticBlocks={staticBlocks}
        onLayoutChange={handleLayoutChange}
        onDeleteStory={handleDeleteStory}
        onDeleteCategoryBlock={handleDeleteCategoryBlock}
        onDeleteStaticBlock={handleDeleteStaticBlock}
        onUpdateCategoryBlock={handleUpdateCategoryBlock}
      />

      <Toast
        show={showToast}
        message="Layout guardado com sucesso!"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
