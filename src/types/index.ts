export type Category = string;

export interface GridState {
  gridConfig: GridConfig;
  categoryBlocks: CategoryBlock[];
  staticBlocks: StaticBlock[];
  lastUpdated: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  category: Category;
  gridPosition?: GridPosition;
}

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GridConfig {
  columns: number;
  rows: number;
  stories: Record<string, Story>;
}

export interface CategoryBlock {
  id: string;
  categoryId: number;
  title: string;
  postsPerPage?: number;
  gridPosition?: GridPosition;
}

export interface StaticBlock {
  id: string;
  title: string;
  content: string;
  gridPosition?: GridPosition;
}