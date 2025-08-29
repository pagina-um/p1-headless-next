// Position types
export interface GridPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const objectPositions = [
  "top",
  "bottom",
  "center",
  "left",
  "right",
] as const;

export type ObjectPosition = (typeof objectPositions)[number];

// Common fields for all blocks
interface BaseBlock {
  uId: string;
  gridPosition: GridPosition;
  mobilePriority: number | null;
}

// Custom fields for story blocks
export interface CustomPostFields {
  antetitulo?: string;
  chamadaDestaque?: string;
  chamadaManchete?: string;
}

// Specific block types
export interface StoryBlock extends BaseBlock, CustomPostFields {
  blockType: "story";
  databaseId: number;
  postId: string;
  title?: string;
  style: "classic" | "modern";
  orientation: "horizontal" | "vertical";
  objectPosition: ObjectPosition;
  hideImage: boolean;
  reverse: boolean;
  expandImage: boolean;
  extraBigTitle: boolean;
}

export interface CategoryBlock extends BaseBlock {
  blockType: "category";
  wpCategoryId: number;
  wpCategoryName: string;
  postsPerPage: number;
}

export interface StaticBlock extends BaseBlock {
  blockType: "static";
  title: string;
  content: string;
  type:
    | "newsletter"
    | "podcast"
    | "divider"
    | "donation"
    | "accountsCounter"
    | "bookPresale";
}

// Union type for all blocks
export type Block = StoryBlock | CategoryBlock | StaticBlock;

// Grid state
export interface GridState {
  blocks: Block[];
  createdAt: string;
}

// Fields that can be overridden
export type OverridableField = "title" | keyof CustomPostFields;

// Block type discriminator
export type BlockType = Block["blockType"];

// Helper type to extract fields that can be modified in settings
export type BlockSettings<T extends Block> = T extends StoryBlock
  ? Pick<
      StoryBlock,
      | "mobilePriority"
      | "style"
      | "orientation"
      | "objectPosition"
      | "reverse"
      | "hideImage"
      | "expandImage"
      | "extraBigTitle"
    >
  : T extends CategoryBlock
    ? Pick<CategoryBlock, "mobilePriority" | "postsPerPage">
    : T extends StaticBlock
      ? Pick<StaticBlock, "mobilePriority">
      : never;
