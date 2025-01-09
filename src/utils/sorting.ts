// utils/sorting.ts
import { Block } from "@/types";

/**
 * 1) Sorts blocks by zigzag (row-major) order using (y, x)
 * 2) Assigns "zigzagIndex" to each item
 * 3) Sorts again by (zigzagIndex - mobilePriority), and uses
 *    mobilePriority as a tiebreaker if final positions are the same.
 */

export function sortBlocksZigzagThenMobilePriority(
  blocks: Block[],
  gridWidth = 6
): Block[] {
  // 1) Sort by zigzag
  const zigzagSorted = [...blocks].sort((a, b) =>
    zigZagSortingFunction(a, b, gridWidth)
  );

  // 2) Attach zigzagIndex
  const withZigzagIndex = zigzagSorted.map((block, index) => ({
    ...block,
    zigzagIndex: index,
  }));

  // 3) Sort by finalPos = (zigzagIndex - mobilePriority)
  //    TIEBREAKER: if two items have the same finalPos, the one with higher mobilePriority goes first
  return withZigzagIndex.sort((a, b) => {
    const aPriority = a.mobilePriority ?? 0;
    const bPriority = b.mobilePriority ?? 0;

    const aFinalPos = a.zigzagIndex - aPriority;
    const bFinalPos = b.zigzagIndex - bPriority;

    // Primary comparison by finalPos
    const posCompare = aFinalPos - bFinalPos;
    if (posCompare !== 0) {
      return posCompare; // ascending
    }

    // Tie-break by priority DESCENDING
    return bPriority - aPriority;
  });
}

/**
 * Sorts two blocks by row-major order (y, then x)
 * @param a
 * @param b
 * @param gridWidth
 * @returns negative if a < b, 0 if tie, positive if a > b
 */
export function zigZagSortingFunction(
  a: Block,
  b: Block,
  gridWidth = 6
): number {
  const aIndex = a.gridPosition.y * gridWidth + a.gridPosition.x;
  const bIndex = b.gridPosition.y * gridWidth + b.gridPosition.x;
  return aIndex - bIndex;
}
