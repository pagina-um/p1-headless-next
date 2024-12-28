import { GRID_SPANS } from "@/constants/blocks";

export function getGridSpan(
  x?: number,
  y?: number,
  width?: number,
  height?: number
) {
  // On mobile: always col-span-1 without explicit start position
  // On tablet (sm): 2 columns, use row spans/starts and limit col spans to max 2
  // On desktop (lg): full 6-column layout with all positioning

  const colStart =
    x !== undefined && x >= 0 && x <= 6
      ? GRID_SPANS.colStart[x as keyof typeof GRID_SPANS.colStart]
      : "";

  const rowStart =
    y !== undefined && y >= 0 && y <= 6
      ? GRID_SPANS.rowStart[y as keyof typeof GRID_SPANS.rowStart]
      : "";

  const tabletColSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.tabletCol[1]
      : GRID_SPANS.tabletCol[width as keyof typeof GRID_SPANS.tabletCol];

  const desktopColSpan =
    !width || width < 1 || width > 6
      ? GRID_SPANS.desktopCol[1]
      : GRID_SPANS.desktopCol[width as keyof typeof GRID_SPANS.desktopCol];

  const rowSpan =
    !height || height < 1 || height > 6
      ? "row-span-1"
      : GRID_SPANS.row[height as keyof typeof GRID_SPANS.row];

  return `col-span-1 ${tabletColSpan} ${desktopColSpan} ${rowSpan} ${colStart} ${rowStart}`.trim();
}
