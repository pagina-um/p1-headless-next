import React, { useState } from "react";
import { BlockSettings, BlockSettingsButton } from "../ui/BlockSettings";
import {
  CategoryBlock,
  objecPositions as objectPositions,
  ObjectPosition,
  StaticBlock,
  StoryBlock,
} from "../../types";

interface BlockWrapperProps {
  children: React.ReactNode;
  title: string;
  onDelete: () => void;
  gridPosition?: { width: number; height: number };
  block: any; // TODO: important to remove this any
  onUpdateBlock: (block: CategoryBlock | StoryBlock) => void;
}

export function BlockWrapper({
  children,
  title,
  onDelete,
  gridPosition,
  block,
  onUpdateBlock,
}: BlockWrapperProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [localPostsPerPage, setLocalPostsPerPage] = useState(
    block.postsPerPage || 5
  );

  const [localStoryStyle, setLocalStoryStyle] = useState(
    block.style || "modern"
  );

  const [localOrientation, setLocalOrientation] = useState<
    "horizontal" | "vertical"
  >(block.orientation || "vertical");

  const [localMobilePriority, setLocalMobilePriority] = useState<number | null>(
    block.mobilePriority || null
  );

  const [localObjectPosition, setLocalObjectPosition] =
    useState<ObjectPosition>(block.objectPosition || "center");

  const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 5;
    setLocalPostsPerPage(Math.max(1, Math.min(20, value)));
  };

  const handleChangeStoryStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalStoryStyle(e.target.value);
  };

  const handleChangeOrientation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value === "horizontal") {
      setLocalOrientation("horizontal");
    }
    if (e.target.value === "vertical") {
      setLocalOrientation("vertical");
    }
  };

  const handleChangeObjectPosition = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (objectPositions.includes(e.target.value as any)) {
      setLocalObjectPosition(e.target.value as any);
    }
  };

  const handleChangeMobilePosition = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseInt(e.target.value) || null;
    setLocalMobilePriority(value);
  };

  const handleClose = () => {
    onUpdateBlock({
      ...block,
      postsPerPage: localPostsPerPage,
      style: localStoryStyle,
      mobilePriority: localMobilePriority,
      orientation: localOrientation,
      objectPosition: localObjectPosition,
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
        <BlockSettings title={title} onClose={handleClose} onDelete={onDelete}>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade telemóvel
                </label>
                <input
                  value={localMobilePriority || ""}
                  type="number"
                  className="text-center w-full  border-gray-300 border focus:border-primary focus:ring-primary"
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
                    className="text-center w-full  border-gray-300 border focus:border-primary focus:ring-primary"
                    value={localPostsPerPage}
                    onChange={handlePostsPerPageChange}
                  />
                </div>
              )}

              {block.blockType === "story" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estilo
                  </label>
                  <select
                    value={localStoryStyle}
                    className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    onChange={handleChangeStoryStyle}
                  >
                    <option value={"classic"}>Clássico</option>
                    <option value={"modern"}>Moderno</option>
                  </select>
                </div>
              )}
              {block.blockType === "story" && block.style === "classic" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Divisão
                  </label>
                  <select
                    value={localOrientation}
                    className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    onChange={handleChangeOrientation}
                  >
                    <option value={"vertical"}>Vertical</option>
                    <option value={"horizontal"}>Horizontal</option>
                  </select>
                </div>
              )}
              {block.blockType === "story" && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posição da imagem
                  </label>
                  <select
                    value={localObjectPosition}
                    className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    onChange={handleChangeObjectPosition}
                  >
                    {objectPositions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </BlockSettings>
      </div>
    </div>
  );
}
