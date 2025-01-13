import React, { useState } from "react";
import { BlockSettingsPanel, BlockSettingsButton } from "../ui/BlockSettings";
import {
  ObjectPosition,
  objectPositions,
  StoryBlock,
  CategoryBlock,
  StaticBlock,
  GridPosition,
  Block,
  BlockSettings,
} from "../../types";
import { useGrid } from "../ui/GridContext";
import { GripVertical } from "lucide-react";
import { twMerge } from "tailwind-merge";

interface BlockWrapperProps<T extends Block> {
  children: React.ReactNode;
  title: string;
  gridPosition?: GridPosition;
  block: T;
}

export function BlockWrapper<T extends Block>({
  children,
  title,
  gridPosition,
  block,
}: BlockWrapperProps<T>) {
  const { handleUpdateBlockSettings, handleDeleteBlock } = useGrid();
  const [isFlipped, setIsFlipped] = useState(false);

  // Initialize state based on block type
  const [blockSettings, setBlockSettings] = useState<BlockSettings<T>>(() => {
    switch (block.blockType) {
      case "story":
        return {
          mobilePriority: block.mobilePriority,
          style: block.style,
          orientation: block.orientation,
          objectPosition: block.objectPosition,
          hideImage: block.hideImage,
          reverse: block.reverse,
        } as BlockSettings<T>;
      case "category":
        return {
          mobilePriority: block.mobilePriority,
          postsPerPage: block.postsPerPage,
        } as BlockSettings<T>;
      case "static":
        return {
          mobilePriority: block.mobilePriority,
        } as BlockSettings<T>;
      default:
        throw new Error(
          `Unsupported block type: ${(block as Block).blockType}`
        );
    }
  });

  const handleChangeMobilePosition = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value) || null;
    setBlockSettings((prev) => ({
      ...prev,
      mobilePriority: value,
    }));
  };

  const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (block.blockType === "category") {
      const value = parseInt(e.target.value) || 5;
      setBlockSettings((prev) => ({
        ...prev,
        postsPerPage: Math.max(1, Math.min(20, value)),
      }));
    }
  };

  const handleChangeStoryStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (block.blockType === "story") {
      setBlockSettings((prev) => ({
        ...prev,
        style: e.target.value as "classic" | "modern",
      }));
    }
  };

  const handleChangeOrientation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (block.blockType === "story") {
      setBlockSettings((prev) => ({
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
      setBlockSettings((prev) => ({
        ...prev,
        objectPosition: e.target.value as ObjectPosition,
      }));
    }
  };

  const handleCheckReverse = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockSettings((prev) => ({
      ...prev,
      reverse: e.target.checked,
    }));
  };

  const handleClose = () => {
    handleUpdateBlockSettings({
      ...block,
      ...blockSettings,
    });
    setIsFlipped(false);
  };

  const handleHideImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlockSettings((prev) => ({
      ...prev,
      hideImage: e.target.checked,
    }));
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
      {block.blockType === "story" && <div>{blockSettings.mobilePriority}</div>}
      <div className="absolute inset-0 backface-hidden">
        <div className="relative h-full group block-content">
          <div
            className={twMerge(
              "drag-handle backface-hidden",
              isFlipped && "pointer-events-none"
            )}
          >
            <GripVertical className="w-4 h-4" />
          </div>
          {children}
          <BlockSettingsButton onClick={() => setIsFlipped(true)} />
        </div>
      </div>

      <div
        className="absolute inset-0 backface-hidden block-settings"
        style={{ transform: "rotateY(180deg)" }}
      >
        <BlockSettingsPanel
          title={title}
          onClose={handleClose}
          onDelete={() => handleDeleteBlock(block.uId)}
        >
          <div className="space-y-2">
            <div className="flex flex-wrap gap-x-4">
              <div className="w-12">
                <label className="block text-xs mb-1 text-gray-600">
                  Prioridade
                </label>
                <input
                  value={blockSettings.mobilePriority || ""}
                  type="number"
                  className="text-center text-xs w-full border-gray-300 border focus:border-primary focus:ring-primary"
                  onChange={handleChangeMobilePosition}
                />
              </div>

              {block.blockType === "category" && (
                <div className="">
                  <label className="block text-xs text-gray-600 mb-1">
                    Número de Artigos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    className="text-center w-full text-xs border-gray-300 border focus:border-primary focus:ring-primary"
                    value={
                      (blockSettings as BlockSettings<CategoryBlock>)
                        .postsPerPage
                    }
                    onChange={handlePostsPerPageChange}
                  />
                </div>
              )}

              {block.blockType === "story" && (
                <>
                  <div className="">
                    <label className="block text-xs text-gray-600 mb-1">
                      Estilo
                    </label>
                    <select
                      value={(blockSettings as BlockSettings<StoryBlock>).style}
                      className="w-full text-xs border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      onChange={handleChangeStoryStyle}
                    >
                      <option value="classic">Clássico</option>
                      <option value="modern">Moderno</option>
                    </select>
                  </div>

                  {(blockSettings as BlockSettings<StoryBlock>).style ===
                    "classic" && (
                    <div className="">
                      <label className="block text-xs text-gray-600 mb-1">
                        Divisão
                      </label>
                      <select
                        value={
                          (blockSettings as BlockSettings<StoryBlock>)
                            .orientation
                        }
                        className="w-full text-xs border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        onChange={handleChangeOrientation}
                      >
                        <option value="vertical">Vertical</option>
                        <option value="horizontal">Horizontal</option>
                      </select>
                    </div>
                  )}

                  {(blockSettings as BlockSettings<StoryBlock>).style ===
                    "classic" && (
                    <div className="">
                      <label className="block text-xs text-gray-600 mb-1">
                        Invertido
                      </label>
                      <input
                        type="checkbox"
                        value={
                          (blockSettings as BlockSettings<StoryBlock>)
                            .orientation
                        }
                        className="w-full border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        onChange={handleCheckReverse}
                      ></input>
                    </div>
                  )}
                  {(blockSettings as BlockSettings<StoryBlock>).style ===
                    "classic" && (
                    <div className="">
                      <label className="block text-xs text-gray-600 mb-1">
                        Esconder foto
                      </label>
                      <input
                        type="checkbox"
                        checked={
                          (blockSettings as BlockSettings<StoryBlock>).hideImage
                        }
                        className="w-full border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                        onChange={handleHideImage}
                      ></input>
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="block text-xs text-gray-600 mb-1">
                      Corte foto
                    </label>
                    <select
                      value={
                        (blockSettings as BlockSettings<StoryBlock>)
                          .objectPosition
                      }
                      className="w-full text-xs border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
        </BlockSettingsPanel>
      </div>
    </div>
  );
}
