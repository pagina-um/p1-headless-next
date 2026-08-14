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

// Fine-grained, optional typography/styling knobs on a story card. All are
// optional so existing saved layouts keep rendering identically; components
// fall back to their historical defaults when a token is absent.
export const titleScales = ["s", "m", "l", "xl"] as const;
export type TitleScale = (typeof titleScales)[number];
export const titleFonts = ["playfair", "instrument"] as const;
export type TitleFont = (typeof titleFonts)[number];
export const densities = ["compact", "normal", "airy"] as const;
export type Density = (typeof densities)[number];

export interface StoryStyleTokens {
  titleScale?: TitleScale;
  titleFont?: TitleFont;
  titleAlign?: "left" | "center";
  showChamada?: boolean;
  density?: Density;
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
  // Controls the background color used for postFields.antetitulo in Classic layout
  // 'auto' uses category detection (opiniao -> blue, otherwise noticia -> primary)
  antetituloColor?: "auto" | "noticia" | "opiniao";
  styleTokens?: StoryStyleTokens;
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
  type: StaticBlockType;
}

// Canonical list of static block type strings (runtime + type-level source of truth)
export const STATIC_BLOCK_TYPES = [
  "newsletter",
  "podcast",
  "divider",
  "donation",
  "accountsCounter",
  "bookPresale",
  "bookPresalePrimado",
  "culturaBanner",
] as const;

export type StaticBlockType = (typeof STATIC_BLOCK_TYPES)[number];

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
      | "antetituloColor"
    >
  : T extends CategoryBlock
    ? Pick<CategoryBlock, "mobilePriority" | "postsPerPage">
    : T extends StaticBlock
      ? Pick<StaticBlock, "mobilePriority">
      : never;
