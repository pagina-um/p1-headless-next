import React from "react";
import RGL, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import { CategoryBlock, StaticBlock, StoryBlock } from "../../types";
import { BlockWrapper } from "../admin/BlockWrapper";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { GripVertical } from "lucide-react";
import { NewsStory } from "../news/NewsStory";
import { CategoryBlockClient } from "../blocks/CategoryBlock.client";

const ReactGridLayout = WidthProvider(RGL);

interface EditableGridProps {
  columns: number;
  blocks: (CategoryBlock | StaticBlock | StoryBlock)[];
  onLayoutChange: (layout: RGL.Layout[]) => void;
  onDeleteBlock: (uId: string) => void;
  onUpdateCategoryBlock?: (block: CategoryBlock) => void;
}

export function EditableGrid({
  columns,
  onLayoutChange,
  blocks,
  onDeleteBlock,
  onUpdateCategoryBlock,
}: EditableGridProps) {
  // Convert grid positions to layout items
  const layout = blocks.map((block) => ({
    i: block.uId,
    x: block.gridPosition?.x || 0,
    y: block.gridPosition?.y || 0,
    w: block.gridPosition?.width || 2,
    h: block.gridPosition?.height || 2,
    minW: 2,
    maxW: columns,
    minH: 1,
    maxH: 4,
  }));

  return (
    <ReactGridLayout
      layout={layout}
      className="layout bg-gray-50 p-4 "
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
      {blocks.map((block) => (
        <div key={block.uId} className="group">
          <BlockWrapper
            title={block.blockType}
            onDelete={() => onDeleteBlock(block.uId)}
          >
            <div className="relative h-full">
              <div className="drag-handle">
                <GripVertical className="w-4 h-4" />
              </div>
              {block.blockType === "category" ? (
                <CategoryBlockClient block={block} />
              ) : block.blockType === "static" ? (
                <StaticBlockComponent block={block} />
              ) : (
                <NewsStory story={block} />
              )}
            </div>
          </BlockWrapper>
        </div>
      ))}
    </ReactGridLayout>
  );
}
