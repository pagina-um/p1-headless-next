export type Category = string;

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoryBlock {
  blockType: "story";
  id: number;
  gridPosition: GridPosition;
}

export interface CategoryBlock {
  blockType: "category";
  categoryId: number;
  postsPerPage: number;
  gridPosition: GridPosition;
}

export interface StaticBlock {
  blockType: "static";
  id: number;
  title: string;
  content: string;
  gridPosition: GridPosition;
}

export interface GridState {
  blocks: (CategoryBlock | StaticBlock | StaticBlock)[];
  createdAt: string;
}
