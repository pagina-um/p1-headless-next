export type Category = string;

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StoryBlock {
  blockType: "story";
  wpPostId: number;
  gridPosition: GridPosition;
  uId: string;
}

export interface CategoryBlock {
  blockType: "category";
  wpCategoryId: number;
  wpCategoryName: string;
  postsPerPage: number;
  gridPosition: GridPosition;
  uId: string;
}

export interface StaticBlock {
  blockType: "static";
  uId: string;
  title: string;
  content: string;
  gridPosition: GridPosition;
}

export interface GridState {
  blocks: (CategoryBlock | StoryBlock | StaticBlock)[];
  createdAt: string;
}

export interface customPostFields {
  antetitulo?: string;
  chamadaDestaque?: string;
  chamadaManchete?: string;
}
