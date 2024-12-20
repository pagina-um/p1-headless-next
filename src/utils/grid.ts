import { Block, GridPosition } from "@/types";
import { BLOCK_MIN_ROWS, GRID_COLUMNS } from "@/constants/blocks";
import { or } from "./categoryUtils";

/**
 * Creates a grid representation marking occupied and empty cells
 */
function createGridMap(blocks: Block[]): string[][] {
  // Calculate grid height from the lowest point of any block
  const gridHeight = blocks.length
    ? Math.max(
        ...blocks.map(
          (block) => block.gridPosition.y + block.gridPosition.height
        )
      )
    : 0;

  // Create empty grid
  const grid = Array(gridHeight)
    .fill(null)
    .map(() => Array(GRID_COLUMNS).fill("X"));

  // Fill in blocks
  blocks.forEach((block, index) => {
    const { x, y, width, height } = block.gridPosition;
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        if (i < gridHeight && j < GRID_COLUMNS) {
          grid[i][j] = (index + 1).toString();
        }
      }
    }
  });

  return grid;
}

/**
 * Returns positions and dimensions of all empty spaces in the grid
 */
export function findEmptySpaces(blocks: Block[]): GridPosition[] {
  const grid = createGridMap(blocks);
  const emptySpaces: GridPosition[] = [];

  // For each cell in the grid
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < GRID_COLUMNS; x++) {
      // Skip if not an empty cell or if we've already included this cell in a space
      if (grid[y][x] !== "X") continue;

      // Find width of empty space
      let width = 0;
      while (x + width < GRID_COLUMNS && grid[y][x + width] === "X") {
        width++;
      }

      // Find height of empty space
      let height = 0;
      let isRectangular = true;
      while (isRectangular && y + height < grid.length) {
        // Check if entire row is empty
        for (let i = 0; i < width; i++) {
          if (grid[y + height][x + i] !== "X") {
            isRectangular = false;
            break;
          }
        }
        if (isRectangular) {
          height++;
        }
      }

      // If we found a space, add it and mark as processed
      if (width > 0 && height > 0) {
        emptySpaces.push({ x, y, width, height });

        // Mark these cells as processed
        for (let i = y; i < y + height; i++) {
          for (let j = x; j < x + width; j++) {
            grid[i][j] = "P"; // P for processed
          }
        }
      }
    }
  }

  return emptySpaces;
}

/**
 * Visualizes the grid layout, showing occupied and empty spaces
 */
export function visualizeGrid(blocks: Block[]): string[] {
  const grid = createGridMap(blocks);
  return grid.map((row) => row.join(" "));
}

export function makeNewBlockOccupyFirstEmptySpace(blocks: Block[]) {
  const emptySpaces = findEmptySpaces(blocks);
  const gridPosition = emptySpaces[0] || {
    x: 0,
    y: 0,
    width: 2,
    height: BLOCK_MIN_ROWS,
  };
  const orientation: "horizontal" | "vertical" =
    emptySpaces.length > 0
      ? emptySpaces[0].width >= emptySpaces[0].height
        ? "horizontal"
        : "vertical"
      : "horizontal";
  return {
    orientation,
    gridPosition,
  };
}
