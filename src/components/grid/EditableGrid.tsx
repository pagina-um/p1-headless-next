import React, { Suspense, useEffect, useMemo, useRef } from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { CategoryBlock, StaticBlock, StoryBlock } from "../../types";
import { BlockWrapper } from "../admin/BlockWrapper";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { GripVertical, Loader } from "lucide-react";
import { CategoryBlockClient } from "../blocks/CategoryBlock.client";
import { NewsStoryClient } from "../blocks/NewsStory/NewsStory.client";

const ReactGridLayout = WidthProvider(RGL);

interface EditableGridProps {
  columns: number;
  blocks: (CategoryBlock | StaticBlock | StoryBlock)[];
  onLayoutChange: (layout: RGL.Layout[]) => void;
  onDeleteBlock: (uId: string) => void;
  onUpdateCategoryBlock: (block: CategoryBlock) => void;
  onUpdateStoryBlock: (block: StoryBlock) => void;
}

export function EditableGrid({
  columns,
  onLayoutChange,
  blocks,
  onDeleteBlock,
  onUpdateCategoryBlock,
  onUpdateStoryBlock,
}: EditableGridProps) {
  // Convert grid positions to layout items
  const layout = useMemo(
    () =>
      blocks.map((block) => ({
        i: block.uId,
        x: block.gridPosition?.x || 0,
        y: block.gridPosition?.y || 0,
        w: block.gridPosition?.width || 2,
        h: block.gridPosition?.height || 2,
        minW: 2,
        maxW: columns,
        minH: 1,
        maxH: 4,
      })),
    [blocks, columns]
  );

  return (
    <ReactGridLayout
      layout={layout}
      className="layout bg-gray-50 p-4 "
      cols={columns}
      rowHeight={200}
      containerPadding={[0, 0]}
      margin={[16, 16]}
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
      {blocks.map((block) => (
        <div key={block.uId} className="group">
          <BlockWrapper
            title={block.blockType}
            onDelete={() => onDeleteBlock(block.uId)}
            onUpdateBlock={(b: CategoryBlock | StoryBlock) => {
              block.blockType === "category"
                ? onUpdateCategoryBlock(b as CategoryBlock)
                : block.blockType === "story"
                ? onUpdateStoryBlock(b as StoryBlock)
                : undefined;
            }}
            block={
              block.blockType === "category" || block.blockType === "story"
                ? block
                : undefined
            }
          >
            <div className="relative h-full">
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
              {block.blockType === "category" ? (
                <Suspense
                  fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}
                >
                  <CategoryBlockClient block={block} />
                </Suspense>
              ) : block.blockType === "static" ? (
                <StaticBlockComponent block={block} />
              ) : (
                <Suspense
                  fallback={<Loader className="w-8 h-8 animate-spin mx-auto" />}
                >
                  <NewsStoryClient story={block} />
                </Suspense>
              )}
            </div>
          </BlockWrapper>
        </div>
      ))}
    </ReactGridLayout>
  );
}
