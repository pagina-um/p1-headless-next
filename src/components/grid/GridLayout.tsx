import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { Story, CategoryBlock, StaticBlock } from "../../types";
import { BlockWrapper } from "../admin/BlockWrapper";
import { CategoryBlockClient as CategoryBlockComponent } from "../blocks/CategoryBlock.client";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { GripVertical } from "lucide-react";

const ReactGridLayout = WidthProvider(RGL);

interface GridLayoutProps {
  columns: number;
  stories: Record<string, Story>;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  onLayoutChange: (layout: RGL.Layout[]) => void;
  onDeleteStory: (id: string) => void;
  onDeleteCategoryBlock: (id: string) => void;
  onDeleteStaticBlock: (id: string) => void;
  onUpdateCategoryBlock?: (block: CategoryBlock) => void;
}

export function GridLayout({
  columns,
  stories,
  categoryBlocks,
  staticBlocks,
  onLayoutChange,
  onDeleteStory,
  onDeleteCategoryBlock,
  onDeleteStaticBlock,
  onUpdateCategoryBlock,
}: GridLayoutProps) {
  // Convert grid positions to layout items
  const layout = [
    ...Object.values(stories).map((story) => ({
      i: story.id,
      x: story.gridPosition?.x || 0,
      y: story.gridPosition?.y || 0,
      w: story.gridPosition?.width || 1,
      h: story.gridPosition?.height || 1,
      minW: 1,
      maxW: columns,
      minH: 1,
      maxH: 4,
    })),
    ...categoryBlocks.map((block) => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w: block.gridPosition?.width || 2,
      h: block.gridPosition?.height || 2,
      minW: 2,
      maxW: columns,
      minH: 1,
      maxH: 4,
    })),
    ...staticBlocks.map((block) => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w: block.gridPosition?.width || 2,
      h: block.gridPosition?.height || 1,
      minW: 2,
      maxW: columns,
      minH: 1,
      maxH: 4,
    })),
  ];

  return (
    <ReactGridLayout
      className="layout bg-gray-50 p-4 "
      layout={layout}
      cols={columns}
      rowHeight={200}
      containerPadding={[0, 0]}
      margin={[16, 16]}
      compactType={null}
      preventCollision={true}
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
      resizeHandles={["se", "sw", "ne", "nw"]}
      isBounded
      // Improve dragging behavior
      isDroppable={false}
      useCSSTransforms={true}
      transformScale={1}
      droppingItem={{ i: "__dropping-elem__", w: 2, h: 2 }}
      // Add delay before drag starts
    >
      {Object.values(stories).map((story) => (
        <div key={story.id} className="group">
          <BlockWrapper
            title={story.title}
            onDelete={() => onDeleteStory(story.id)}
          >
            <div className="relative overflow-hidden  shadow-lg h-full">
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
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
        </div>
      ))}

      {categoryBlocks.map((block) => (
        <div key={block.id} className="group">
          <BlockWrapper
            title={block.title}
            onDelete={() => onDeleteCategoryBlock(block.id)}
            block={block}
            onUpdateBlock={onUpdateCategoryBlock}
          >
            <div className="relative h-full">
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
              <CategoryBlockComponent block={block} />
            </div>
          </BlockWrapper>
        </div>
      ))}

      {staticBlocks.map((block) => (
        <div key={block.id} className="group">
          <BlockWrapper
            title={block.title}
            onDelete={() => onDeleteStaticBlock(block.id)}
          >
            <div className="relative h-full">
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
              <StaticBlockComponent block={block} />
            </div>
          </BlockWrapper>
        </div>
      ))}
    </ReactGridLayout>
  );
}
