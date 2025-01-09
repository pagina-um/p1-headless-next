import React, { useState } from "react";
import { BlockSettings, BlockSettingsButton } from "../ui/BlockSettings";
import {
  ObjectPosition,
  objectPositions,
  StoryBlock,
  CategoryBlock,
  StaticBlock,
  GridPosition,
} from "../../types";
import { useGrid } from "../ui/GridContext";

type BlockType = StoryBlock | CategoryBlock | StaticBlock;

// Using Pick to define local states from block types
type LocalState<T extends BlockType> = T extends StoryBlock
  ? Pick<
      StoryBlock,
      "mobilePriority" | "style" | "orientation" | "objectPosition"
    >
  : T extends CategoryBlock
  ? Pick<CategoryBlock, "mobilePriority" | "postsPerPage">
  : T extends StaticBlock
  ? Pick<StaticBlock, "mobilePriority">
  : never;

interface BlockWrapperProps<T extends BlockType> {
  children: React.ReactNode;
  title: string;
  gridPosition?: GridPosition;
  block: T;
}

export function BlockWrapper<T extends BlockType>({
  children,
  title,
  gridPosition,
  block,
}: BlockWrapperProps<T>) {
  const { handleUpdateBlockSettings, handleDeleteBlock } = useGrid();
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize state based on block type
  const [localState, setLocalState] = useState<LocalState<T>>(() => {
    switch (block.blockType) {
      case "story":
        return {
          mobilePriority: block.mobilePriority,
          style: block.style,
          orientation: block.orientation,
          objectPosition: block.objectPosition,
        } as LocalState<T>;
      case "category":
        return {
          mobilePriority: block.mobilePriority,
          postsPerPage: block.postsPerPage,
        } as LocalState<T>;
      case "static":
        return {
          mobilePriority: block.mobilePriority,
        } as LocalState<T>;
      default:
        throw new Error(
          `Unsupported block type: ${(block as BlockType).blockType}`
        );
    }
  });

  const handleChangeMobilePosition = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value) || null;
    setLocalState((prev) => ({
      ...prev,
      mobilePriority: value,
    }));
  };

  const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (block.blockType === "category") {
      const value = parseInt(e.target.value) || 5;
      setLocalState((prev) => ({
        ...prev,
        postsPerPage: Math.max(1, Math.min(20, value)),
      }));
    }
  };

  const handleChangeStoryStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (block.blockType === "story") {
      setLocalState((prev) => ({
        ...prev,
        style: e.target.value as "classic" | "modern",
      }));
    }
  };

  const handleChangeOrientation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (block.blockType === "story") {
      setLocalState((prev) => ({
        ...prev,
        orientation: e.target.value as "horizontal" | "vertical",
      }));
    }
  };

  const handleChangeObjectPosition = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (
      block.blockType === "story" &&
      objectPositions.includes(e.target.value as ObjectPosition)
    ) {
      setLocalState((prev) => ({
        ...prev,
        objectPosition: e.target.value as ObjectPosition,
      }));
    }
  };

  const handleClose = () => {
    handleUpdateBlockSettings({
      ...block,
      ...localState,
    });
    setIsFlipped(false);
  };

  return (
    <div
      className="relative h-full preserve-3d transition-transform duration-500"
      style={{
        gridColumn: `span ${gridPosition?.width || 1}`,
        gridRow: `span ${gridPosition?.height || 1}`,
        transform: isFlipped ? "rotateY(180deg)" : "rotateY(0)",
      }}
    >
      {/* Front side */}
      <div className="absolute inset-0 backface-hidden">
        <div className="relative h-full group block-content">
          {children}
          <BlockSettingsButton onClick={() => setIsFlipped(true)} />
        </div>
      </div>

      {/* Back side */}
      <div
        className="absolute inset-0 backface-hidden block-settings"
        style={{ transform: "rotateY(180deg)" }}
      >
        <BlockSettings
          title={title}
          onClose={handleClose}
          onDelete={() => handleDeleteBlock(block.uId)}
        >
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade telemóvel
                </label>
                <input
                  value={localState.mobilePriority || ""}
                  type="number"
                  className="text-center w-full border-gray-300 border focus:border-primary focus:ring-primary"
                  onChange={handleChangeMobilePosition}
                />
              </div>

              {block.blockType === "category" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Artigos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="text-center w-full border-gray-300 border focus:border-primary focus:ring-primary"
                    value={
                      (localState as LocalState<CategoryBlock>).postsPerPage
                    }
                    onChange={handlePostsPerPageChange}
                  />
                </div>
              )}

              {block.blockType === "story" && (
                <>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estilo
                    </label>
                    <select
                      value={(localState as LocalState<StoryBlock>).style}
                      className="w-full border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      onChange={handleChangeStoryStyle}
                    >
                      <option value="classic">Clássico</option>
                      <option value="modern">Moderno</option>
                    </select>
                  </div>

                  {(localState as LocalState<StoryBlock>).style ===
                    "classic" && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Divisão
                      </label>
                      <select
                        value={
                          (localState as LocalState<StoryBlock>).orientation
                        }
                        className="w-full border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        onChange={handleChangeOrientation}
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                      </select>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Posição da imagem
                    </label>
                    <select
                      value={
                        (localState as LocalState<StoryBlock>).objectPosition
                      }
                      className="w-full border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      onChange={handleChangeObjectPosition}
                    >
                      {objectPositions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
          </div>
        </BlockSettings>
      </div>
    </div>
  );
}
