"use client";
import { Responsive, WidthProvider } from "react-grid-layout";
import { Story, CategoryBlock, StaticBlock } from "@/types";
import { NewsStory } from "./NewsStory";
import { CategoryBlock as CategoryBlockComponent } from "../blocks/CategoryBlock";
import { StaticBlock as StaticBlockComponent } from "../blocks/StaticBlock";
import { EmptyState } from "../ui/EmptyState";
import { generateLayouts, BREAKPOINTS, COLS } from "@/utils/gridLayoutUtils";
import "react-grid-layout/css/styles.css";

const ResponsiveGridLayout = WidthProvider(Responsive);

interface NewsGridProps {
  stories: Record<string, Story>;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
}

export function NewsGrid({
  stories = {},
  categoryBlocks = [],
  staticBlocks = [],
}: NewsGridProps) {
  const hasContent =
    Object.keys(stories).length > 0 ||
    categoryBlocks.length > 0 ||
    staticBlocks.length > 0;

  if (!hasContent) {
    return <EmptyState message="No content has been added to the grid yet." />;
  }

  const layouts = generateLayouts(stories, categoryBlocks, staticBlocks);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={BREAKPOINTS}
      cols={COLS}
      rowHeight={200}
      isDraggable={false}
      isResizable={false}
      containerPadding={[16, 16]}
      margin={[16, 16]}
      compactType="vertical"
      useCSSTransforms
    >
      {Object.values(stories).map((story) => (
        <div key={story.id}>
          <NewsStory story={story} />
        </div>
      ))}
      {categoryBlocks.map((block) => (
        <div key={block.id}>
          <CategoryBlockComponent block={block} />
        </div>
      ))}
      {staticBlocks.map((block) => (
        <div key={block.id}>
          <StaticBlockComponent block={block} />
        </div>
      ))}
    </ResponsiveGridLayout>
  );
}
