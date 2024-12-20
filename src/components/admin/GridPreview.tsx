import React from "react";
import { Story, CategoryBlock, StaticBlock } from "../../types";
import { CategoryBlockClient as CategoryBlockComponent } from "../blocks/CategoryBlock.client";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { BlockWrapper } from "./BlockWrapper";

interface GridPreviewProps {
  columns: number;
  rows: number;
  stories: Record<string, Story>;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  selectedStory: Story | null;
  selectedBlock: CategoryBlock | StaticBlock | null;
  onCellClick: (x: number, y: number) => void;
  onBlockCellClick: (x: number, y: number) => void;
  onDeleteStory: (storyId: string) => void;
  onDeleteCategoryBlock: (blockId: string) => void;
  onDeleteStaticBlock: (blockId: string) => void;
}

export function GridPreview({
  columns,
  rows,
  stories,
  categoryBlocks,
  staticBlocks,
  selectedStory,
  selectedBlock,
  onCellClick,
  onBlockCellClick,
  onDeleteStory,
  onDeleteCategoryBlock,
  onDeleteStaticBlock,
}: GridPreviewProps) {
  const handleCellClick = (x: number, y: number) => {
    if (selectedStory) {
      onCellClick(x, y);
    } else if (selectedBlock) {
      onBlockCellClick(x, y);
    }
  };

  const isOccupied = (x: number, y: number) => {
    return [...Object.values(stories), ...categoryBlocks, ...staticBlocks].some(
      (item) => {
        const { gridPosition } = item;
        return (
          gridPosition &&
          x >= gridPosition.x &&
          x < gridPosition.x + gridPosition.width &&
          y >= gridPosition.y &&
          y < gridPosition.y + gridPosition.height
        );
      }
    );
  };

  return (
    <div className="bg-white  shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Pré-visualização da Grelha</h2>
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(200px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(200px, auto))`,
        }}
      >
        {Object.values(stories).map((story) => (
          <BlockWrapper
            key={story.id}
            title={story.title}
            onDelete={() => onDeleteStory(story.id)}
            gridPosition={story.gridPosition}
          >
            <div className="relative overflow-hidden  shadow-lg group">
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="absolute bottom-0 p-6 text-white">
                  <h2 className="font-serif text-2xl font-bold mb-2">
                    {story.title}
                  </h2>
                </div>
              </div>
            </div>
          </BlockWrapper>
        ))}

        {categoryBlocks.map((block) => (
          <BlockWrapper
            key={block.id}
            title={block.title}
            onDelete={() => onDeleteCategoryBlock(block.id)}
            gridPosition={block.gridPosition}
          >
            <CategoryBlockComponent block={block} />
          </BlockWrapper>
        ))}

        {staticBlocks.map((block) => (
          <BlockWrapper
            key={block.id}
            title={block.title}
            onDelete={() => onDeleteStaticBlock(block.id)}
            gridPosition={block.gridPosition}
          >
            <StaticBlockComponent block={block} />
          </BlockWrapper>
        ))}

        {Array.from({ length: rows * columns }).map((_, index) => {
          const x = index % columns;
          const y = Math.floor(index / columns);

          if (isOccupied(x, y)) return null;

          return (
            <div
              key={`empty-${index}`}
              className={`border-2 border-dashed border-gray-300  p-2 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedStory || selectedBlock ? "hover:border-blue-500" : ""
              }`}
              onClick={() => handleCellClick(x, y)}
            >
              {(selectedStory || selectedBlock) && (
                <span className="text-sm text-gray-500">
                  Clique para colocar
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
