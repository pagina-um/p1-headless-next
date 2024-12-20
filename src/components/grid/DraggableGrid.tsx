import React from 'react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Story, CategoryBlock, StaticBlock } from '../../types';
import { BlockWrapper } from '../admin/BlockWrapper';

const ReactGridLayout = WidthProvider(RGL);

interface DraggableGridProps {
  stories: Record<string, Story>;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  onLayoutChange: (layout: RGL.Layout[]) => void;
  onDeleteBlock: (id: string) => void;
}

export function DraggableGrid({
  stories,
  categoryBlocks,
  staticBlocks,
  onLayoutChange,
  onDeleteBlock,
}: DraggableGridProps) {
  // Convert grid positions to layout items
  const layout = [
    ...Object.values(stories).map(story => ({
      i: story.id,
      x: story.gridPosition?.x || 0,
      y: story.gridPosition?.y || 0,
      w: story.gridPosition?.width || 1,
      h: story.gridPosition?.height || 1,
      isDraggable: true,
      isResizable: true,
    })),
    ...categoryBlocks.map(block => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w: block.gridPosition?.width || 2,
      h: block.gridPosition?.height || 2,
      isDraggable: true,
      isResizable: true,
    })),
    ...staticBlocks.map(block => ({
      i: block.id,
      x: block.gridPosition?.x || 0,
      y: block.gridPosition?.y || 0,
      w: block.gridPosition?.width || 1,
      h: block.gridPosition?.height || 1,
      isDraggable: true,
      isResizable: true,
    })),
  ];

  return (
    <ReactGridLayout
      className="layout bg-gray-100 p-4 rounded-lg"
      layout={layout}
      cols={4}
      rowHeight={150}
      width={1200}
      compactType={null}
      preventCollision
      onLayoutChange={onLayoutChange}
      draggableHandle=".drag-handle"
    >
      {Object.values(stories).map(story => (
        <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          <BlockWrapper
            title={story.title}
            onDelete={() => onDeleteBlock(story.id)}
          >
            <div className="relative h-full">
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                <div className="absolute bottom-0 p-4">
                  <h3 className="text-white font-bold">{story.title}</h3>
                </div>
              </div>
            </div>
          </BlockWrapper>
        </div>
      ))}

      {categoryBlocks.map(block => (
        <div key={block.id} className="bg-white rounded-lg shadow-lg p-4">
          <BlockWrapper
            title={block.title}
            onDelete={() => onDeleteBlock(block.id)}
          >
            <h3 className="font-bold mb-2">{block.title}</h3>
            <div className="text-sm text-gray-600">Category Block Content</div>
          </BlockWrapper>
        </div>
      ))}

      {staticBlocks.map(block => (
        <div key={block.id} className="bg-white rounded-lg shadow-lg p-4">
          <BlockWrapper
            title={block.title}
            onDelete={() => onDeleteBlock(block.id)}
          >
            <h3 className="font-bold mb-2">{block.title}</h3>
            <div className="text-sm text-gray-600">{block.content}</div>
          </BlockWrapper>
        </div>
      ))}
    </ReactGridLayout>
  );
}