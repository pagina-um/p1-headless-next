import React, { useCallback, useEffect, useState } from "react";
import { Settings, Save } from "lucide-react";
import { EditableGrid } from "../grid/EditableGrid";
import { Toast } from "../ui/Toast";
import { loadGridState, saveGridState } from "@/services/jsonbin";
import { GridState, CategoryBlock, StaticBlock, StoryBlock } from "@/types";
import { BlocksTabs } from "./BlocksTabs";
import { StoriesList } from "./StoriesList";
import { GRID_COLUMNS } from "../../constants/grid";
import RGL from "react-grid-layout";

interface AdminPanelProps {}

export function AdminPanel({}: AdminPanelProps) {
  debugger;
  const [gridState, setGridState] = useState<GridState>();

  useEffect(() => {
    const fetchGridState = async () => {
      const gridState = await loadGridState();
      if (gridState) {
        console.log("admin", gridState.blocks);
        setGridState(gridState);
      }
    };

    fetchGridState();
  }, []);

  const [showToast, setShowToast] = useState(false);

  const handleLayoutChange = (layout: RGL.Layout[]) => {
    debugger;
    if (!gridState) return;

    const updatedBlocks = gridState.blocks.map((block) => {
      const layoutItem = layout.find((item) => item.i === block.uId);
      if (layoutItem) {
        return {
          ...block,
          gridPosition: {
            x: layoutItem.x,
            y: layoutItem.y,
            width: layoutItem.w,
            height: layoutItem.h,
          },
        };
      }
      return block;
    });

    setGridState({ ...gridState, blocks: updatedBlocks });
  };

  const handleDeleteBlock = (uId: string) => {
    if (!gridState) return;
    setGridState({
      ...gridState,
      blocks: gridState.blocks.filter((block) => block.uId !== uId),
    });
  };

  const handleSave = async () => {
    if (!gridState) return;
    try {
      await saveGridState(gridState);
      setShowToast(true);
    } catch (error) {
      console.error("Failed to save grid state:", error);
    }
  };

  const handleCreateCategoryBlock = (id: number, name: string) => {
    if (!gridState) return;
    const newBlock: CategoryBlock = {
      wpCategoryId: id,
      wpCategoryName: name,
      blockType: "category",
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
      uId: Date.now().toString(),
      postsPerPage: 5,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStaticBlock = () => {
    if (!gridState) return;
    const newBlock: StaticBlock = {
      uId: Date.now().toString(),
      blockType: "static",
      title: "New Static Block",
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
      content: "Static content",
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

  const handleCreateStoryBlock = (wpPostId: number) => {
    if (!gridState) return;
    const newBlock: StoryBlock = {
      uId: Date.now().toString(),
      blockType: "story",
      gridPosition: { x: 0, y: 0, width: 2, height: 2 },
      wpPostId,
    };
    setGridState({
      ...gridState,
      blocks: [...gridState.blocks, newBlock],
    });
  };

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
