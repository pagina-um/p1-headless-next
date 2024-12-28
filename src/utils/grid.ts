import { GRID_SPANS } from "@/constants/blocks";

export function getGridSpan(
  x?: number,
  y?: number,
  width?: number,
  height?: number
) {
  // Mobile is always single column, full width
  const baseClasses = ["col-span-1"];

  // Desktop layout (6 columns)
  if (x !== undefined && x >= 0 && x <= 6) {
    baseClasses.push(
      GRID_SPANS.colStart[x as keyof typeof GRID_SPANS.colStart]
    );
  }

  if (y !== undefined && y >= 0 && y <= 6) {
    baseClasses.push(
      GRID_SPANS.rowStart[y as keyof typeof GRID_SPANS.rowStart]
    );
  }

  const colSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.col[1]
      : GRID_SPANS.col[width as keyof typeof GRID_SPANS.col];

  const rowSpan =
    !height || height < 1 || height > 6
      ? GRID_SPANS.row[1]
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  baseClasses.push(colSpan, rowSpan);

  return baseClasses.filter(Boolean).join(" ");
}
