import type {
  BoundingBox,
  GeographyMunicipality,
  GeographyRegion,
  Geometry,
  MunicipalityGroup,
  Position,
} from "./types";

export interface MapFrame {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type MapProjection = (point: Position) => Position;

export interface MapMarker {
  group: MunicipalityGroup;
  anchor: Position;
  point: Position;
  radius: number;
  hitRadius: number;
  displaced: boolean;
}

export interface RegionMapLayout {
  width: number;
  height: number;
  project: MapProjection;
  markers: MapMarker[];
}

/** Avoid server/browser floating-point differences in SVG attributes. */
export function svgCoordinate(value: number): string {
  const coordinate = value.toFixed(3);
  return coordinate === "-0.000" ? "0.000" : coordinate;
}

function mercator(point: Position): Position {
  const latitude = (Math.max(-80, Math.min(80, point[1])) * Math.PI) / 180;
  return [
    point[0],
    (Math.log(Math.tan(Math.PI / 4 + latitude / 2)) * 180) / Math.PI,
  ];
}

export function createProjection(
  boundingBox: BoundingBox,
  frame: MapFrame
): MapProjection {
  const lower = mercator([boundingBox[0], boundingBox[1]]);
  const upper = mercator([boundingBox[2], boundingBox[3]]);
  const scale = Math.min(
    frame.w / (upper[0] - lower[0]),
    frame.h / (upper[1] - lower[1])
  );
  const offsetX = frame.x + (frame.w - (upper[0] - lower[0]) * scale) / 2;
  const offsetY = frame.y + (frame.h - (upper[1] - lower[1]) * scale) / 2;
  return (point) => {
    const projected = mercator(point);
    return [
      offsetX + (projected[0] - lower[0]) * scale,
      offsetY + (upper[1] - projected[1]) * scale,
    ];
  };
}

export function geometryPath(
  geometry: Geometry,
  project: MapProjection
): string {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .map((polygon) =>
      polygon
        .map(
          (ring) =>
            ring
              .map((coordinate, index) => {
                const [x, y] = project(coordinate);
                return `${index ? "L" : "M"}${svgCoordinate(x)},${svgCoordinate(y)}`;
              })
              .join("") + "Z"
        )
        .join("")
    )
    .join("");
}

function markerSize(group: MunicipalityGroup) {
  const radius = Math.max(
    group.assigned && group.possible ? 23 : 18,
    Math.min(24, 10 + Math.sqrt(group.ids.length) * 3)
  );
  return {
    radius,
    hitRadius: Math.max(
      22,
      radius + (group.assigned && group.possible ? 6 : 2)
    ),
  };
}

function positionMarkers(
  groups: MunicipalityGroup[],
  municipalities: ReadonlyMap<string, GeographyMunicipality>,
  project: MapProjection,
  frame: MapFrame
): MapMarker[] | null {
  const placed: MapMarker[] = [];
  for (const group of groups) {
    const municipality = municipalities.get(group.id);
    if (!municipality) continue;
    const anchor = project(municipality.anchor);
    const { radius, hitRadius } = markerSize(group);
    const margin = hitRadius + 4;
    const valid = (point: Position) =>
      point[0] >= frame.x + margin &&
      point[0] <= frame.x + frame.w - margin &&
      point[1] >= frame.y + margin &&
      point[1] <= frame.y + frame.h - margin &&
      placed.every(
        (other) =>
          Math.hypot(point[0] - other.point[0], point[1] - other.point[1]) >=
          hitRadius + other.hitRadius + 8
      );

    let point: Position | null = valid(anchor) ? anchor : null;
    for (
      let distance = 12;
      !point && distance <= Math.max(frame.w, frame.h);
      distance += 9
    ) {
      const steps = Math.max(20, Math.ceil((2 * Math.PI * distance) / 12));
      for (let index = 0; index < steps; index += 1) {
        const angle = (index / steps) * 2 * Math.PI - Math.PI / 2;
        const candidate: Position = [
          anchor[0] + Math.cos(angle) * distance,
          anchor[1] + Math.sin(angle) * distance,
        ];
        if (valid(candidate)) {
          point = candidate;
          break;
        }
      }
    }
    if (!point) return null;
    placed.push({
      group,
      anchor,
      point,
      radius,
      hitRadius,
      displaced: Math.hypot(anchor[0] - point[0], anchor[1] - point[1]) > 3,
    });
  }
  return placed;
}

/** Keep municipal coordinates unchanged; displace only their screen markers. */
export function createRegionMapLayout(
  region: GeographyRegion,
  groups: MunicipalityGroup[],
  municipalities: ReadonlyMap<string, GeographyMunicipality>,
  measuredWidth: number
): RegionMapLayout {
  const width = Math.max(220, Math.round(measuredWidth));
  const ordered = groups
    .filter((group) => municipalities.get(group.id)?.region === region.id)
    .sort(
      (left, right) =>
        right.ids.length - left.ids.length ||
        (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    );
  const baseHeight =
    region.id === "continente"
      ? Math.max(460, Math.min(680, width * 1.65))
      : Math.max(260, Math.min(360, width * 0.85));
  const cellSize = 72;
  const columns = Math.max(1, Math.floor((width - 48) / cellSize));
  let height = Math.max(
    baseHeight,
    Math.ceil(ordered.length / columns) * 60 + 48
  );

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const frame = { x: 16, y: 16, w: width - 32, h: height - 32 };
    const project = createProjection(region.bbox, frame);
    const markers = positionMarkers(ordered, municipalities, project, frame);
    if (markers) return { width, height, project, markers };
    height += 120;
  }

  // A finite grid fallback guarantees separate 44px-or-larger hit targets.
  // Leader lines retain the relationship to the original municipal anchors.
  height = Math.max(
    height,
    Math.ceil(ordered.length / columns) * cellSize + 48
  );
  const frame = { x: 16, y: 16, w: width - 32, h: height - 32 };
  const project = createProjection(region.bbox, frame);
  const gridWidth = columns * cellSize;
  const gridStart = (width - gridWidth) / 2;
  const markers = ordered.map((group, index): MapMarker => {
    const municipality = municipalities.get(group.id)!;
    const anchor = project(municipality.anchor);
    const point: Position = [
      gridStart + (index % columns) * cellSize + cellSize / 2,
      24 + Math.floor(index / columns) * cellSize + cellSize / 2,
    ];
    return {
      group,
      anchor,
      point,
      ...markerSize(group),
      displaced: Math.hypot(anchor[0] - point[0], anchor[1] - point[1]) > 3,
    };
  });
  return { width, height, project, markers };
}

export function municipalityLabel(group: MunicipalityGroup): string {
  const assigned = `${group.assigned} ${group.assigned === 1 ? "registo" : "registos"} na contagem principal`;
  const possible = group.possible ? `, ${group.possible} com ano incerto` : "";
  return `${group.name}: ${assigned}${possible}`;
}

export function safeMapSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.href
      : null;
  } catch {
    return null;
  }
}
