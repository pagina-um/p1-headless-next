import React, { useState } from "react";
import { BlockSettings, BlockSettingsButton } from "../ui/BlockSettings";
import { CategoryBlock } from "../../types";

interface BlockWrapperProps {
  children: React.ReactNode;
  title: string;
  onDelete: () => void;
  gridPosition?: { width: number; height: number };
  block?: CategoryBlock;
  onUpdateBlock?: (block: CategoryBlock) => void;
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
  const [tempPostsPerPage, setTempPostsPerPage] = useState(
    block?.postsPerPage || 5
  );

  const handlePostsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 5;
    setTempPostsPerPage(Math.max(1, Math.min(20, value)));
  };

  const handleClose = () => {
    if (block && onUpdateBlock && tempPostsPerPage !== block.postsPerPage) {
      onUpdateBlock({
        ...block,
        postsPerPage: tempPostsPerPage,
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

            {block && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número de Artigos
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={tempPostsPerPage}
                  onChange={handlePostsPerPageChange}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo: 1, Máximo: 20
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estilo
              </label>
              <select
                className="w-full  border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                disabled
              >
                <option>Padrão</option>
                <option>Compacto</option>
                <option>Destacado</option>
              </select>
            </div>
          </div>
        </BlockSettings>
      </div>
    </div>
  );
}
