export type Category = string;

export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const objecPositions = [
  "top",
  "bottom",
  "center",
  "left",
  "right",
] as const;

export type ObjectPosition = (typeof objecPositions)[number];
export interface StoryBlock extends CustomPostFields {
  blockType: "story";
  wpPostId: number;
  gridPosition: GridPosition;
  uId: string;
  style: "classic" | "modern";
  mobilePriority: number | null;
  title?: string;
  orientation: "horizontal" | "vertical";
  objectPosition: ObjectPosition;
}

export interface CategoryBlock {
  blockType: "category";
  wpCategoryId: number;
  wpCategoryName: string;
  postsPerPage: number;
  gridPosition: GridPosition;
  uId: string;
  mobilePriority: number | null;
}

export interface StaticBlock {
  blockType: "static";
  uId: string;
  title: string;
  content: string;
  gridPosition: GridPosition;
  mobilePriority: number | null;
}

export interface GridState {
  blocks: (CategoryBlock | StoryBlock | StaticBlock)[];
  createdAt: string;
}

export interface CustomPostFields {
  antetitulo?: string;
  chamadaDestaque?: string;
  chamadaManchete?: string;
}

export type OverridableField = "title" | keyof CustomPostFields;
