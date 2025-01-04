import React, { useState } from "react";
import { BlockSettings, BlockSettingsButton } from "../ui/BlockSettings";
import { CategoryBlock, StoryBlock } from "../../types";

interface BlockWrapperProps {
  children: React.ReactNode;
  title: string;
  onDelete: () => void;
  gridPosition?: { width: number; height: number };
  block?: CategoryBlock | StoryBlock | any; // TODO: remove any
  onUpdateBlock?: (block: CategoryBlock | StoryBlock) => void;
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
    block?.postsPerPage || 5
  );

  const [localStoryStyle, setLocalStoryStyle] = useState(
    block?.style || "modern"
  );

  const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 5;
    setLocalPostsPerPage(Math.max(1, Math.min(20, value)));
  };

  const handleChangeStoryStyle = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalStoryStyle(e.target.value);
  };

  const handleClose = () => {
    debugger;
    if (
      block &&
      block?.blockType === "category" &&
      onUpdateBlock &&
      localPostsPerPage !== block.postsPerPage
    ) {
      onUpdateBlock({
        ...block,
        postsPerPage: localPostsPerPage,
      });
    }
    if (
      block &&
      block?.blockType === "story" &&
      onUpdateBlock &&
      localStoryStyle !== block.style
    ) {
      onUpdateBlock({
        ...block,
        style: localStoryStyle,
      });
    }
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={title}
                onChange={() => {}}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Posição na grelha MOBILE
              </label>
              <input
                type="number"
                className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={title}
                onChange={() => {}}
              />
            </div>

            {block && block.blockType === "category" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Artigos
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={localPostsPerPage}
                  onChange={handlePostsPerPageChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo: 1, Máximo: 20
                </p>
              </div>
            )}

            {block && block.blockType === "story" && (
              <div>
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
          </div>
        </BlockSettings>
      </div>
    </div>
  );
}
