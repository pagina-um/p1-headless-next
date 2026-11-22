import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  createRegionMapLayout,
  geometryPath,
  municipalityLabel,
  safeMapSourceUrl,
  svgCoordinate,
} from "../_lib/map";
import type {
  Geography,
  GeographyMunicipality,
  GeographyRegion,
  MunicipalityGroup,
  RegionFilter,
  RegionId,
} from "../_lib/types";

interface HeritageMapProps {
  geography: Geography;
  groups: MunicipalityGroup[];
  selectedMunicipality: string;
  region: RegionFilter;
  onSelect: (id: string) => void;
}

interface RegionPanelProps {
  region: GeographyRegion;
  municipalities: GeographyMunicipality[];
  municipalityIndex: ReadonlyMap<string, GeographyMunicipality>;
  groups: MunicipalityGroup[];
  selectedMunicipality: string;
  onSelect: (id: string) => void;
  onInspect: (id: string | null) => void;
  showAll: boolean;
}

const REGION_ORDER: RegionId[] = ["continente", "acores", "madeira"];

function usePanelWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);
      if (nextWidth > 0) setWidth(nextWidth);
    };
    updateWidth();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateWidth);
      return () => window.removeEventListener("resize", updateWidth);
    }
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { ref, width };
}

function activateOnKeyboard(
  event: KeyboardEvent<SVGGElement>,
  activate: () => void
) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

function RegionPanel({
  region,
  municipalities,
  municipalityIndex,
  groups,
  selectedMunicipality,
  onSelect,
  onInspect,
  showAll,
}: RegionPanelProps) {
  const id = useId();
  const { ref, width } = usePanelWidth();
  const layout = useMemo(
    () => createRegionMapLayout(region, groups, municipalityIndex, width),
    [region, groups, municipalityIndex, width]
  );
  const groupIndex = useMemo(
    () => new Map(groups.map((group) => [group.id, group])),
    [groups]
  );
  const paths = useMemo(
    () =>
      municipalities.map((municipality) => ({
        municipality,
        path: geometryPath(municipality.geometry, layout.project),
      })),
    [municipalities, layout.project]
  );
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;

  return (
    <section
      className={
        showAll && region.id === "continente"
          ? "min-w-0 @2xl:row-span-2"
          : "min-w-0"
      }
      aria-labelledby={titleId}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-gray-200 pb-2">
        <h3
          id={titleId}
          className="!text-[11px] !font-semibold uppercase tracking-wider text-stone-600"
        >
          {region.name}
        </h3>
        <span className="text-xs text-stone-500">Escala própria</span>
      </div>
      <div ref={ref} className="w-full">
        <svg
          className="block h-auto w-full"
          viewBox={`0 0 ${svgCoordinate(layout.width)} ${svgCoordinate(layout.height)}`}
          role="group"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          data-region={region.id}
        >
          <desc id={descriptionId}>
            {region.name}. Pontos agregados por concelho, sem localização exacta
            dos edifícios. Use Tab para percorrer os pontos e Enter ou Espaço
            para seleccionar um concelho.
          </desc>
          <path
            d={geometryPath(region.geometry, layout.project)}
            className="fill-gray-100 stroke-gray-300 stroke-1"
            fillRule="evenodd"
            vectorEffect="non-scaling-stroke"
            aria-hidden="true"
          />
          {paths.map(({ municipality, path }) => {
            const group = groupIndex.get(municipality.id);
            const selected = selectedMunicipality === municipality.id;
            const fillClass = selected
              ? "fill-primary-lightest"
              : group
                ? "fill-gray-300 hover:fill-gray-400"
                : "fill-gray-100";
            return (
              <path
                key={municipality.id}
                d={path}
                fillRule="evenodd"
                vectorEffect="non-scaling-stroke"
                className={`${fillClass} ${
                  region.id === "continente"
                    ? "stroke-gray-200 stroke-1"
                    : "stroke-none"
                } ${group ? "cursor-pointer" : ""}`}
                onPointerUp={group ? () => onSelect(group.id) : undefined}
                onPointerEnter={group ? () => onInspect(group.id) : undefined}
                onPointerLeave={group ? () => onInspect(null) : undefined}
                aria-hidden="true"
              />
            );
          })}
          <g aria-hidden="true" className="pointer-events-none">
            {layout.markers
              .filter((marker) => marker.displaced)
              .map(({ group, anchor, point }) => (
                <g key={group.id}>
                  <line
                    x1={svgCoordinate(anchor[0])}
                    y1={svgCoordinate(anchor[1])}
                    x2={svgCoordinate(point[0])}
                    y2={svgCoordinate(point[1])}
                    className="stroke-stone-400 stroke-1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={svgCoordinate(anchor[0])}
                    cy={svgCoordinate(anchor[1])}
                    r={2.5}
                    className="fill-stone-500"
                  />
                </g>
              ))}
          </g>
          {layout.markers.map(({ group, point, radius, hitRadius }) => {
            const selected = selectedMunicipality === group.id;
            const possibleOnly = group.assigned === 0;
            const label = group.possible
              ? `${group.assigned || ""}${group.assigned ? "+" : ""}${group.possible}?`
              : String(group.assigned);
            const markerClass = selected
              ? possibleOnly
                ? "fill-white stroke-primary"
                : "fill-primary stroke-primary"
              : possibleOnly
                ? "fill-white stroke-stone-600"
                : "fill-stone-800 stroke-stone-800";
            return (
              <g
                key={group.id}
                transform={`translate(${svgCoordinate(point[0])},${svgCoordinate(point[1])})`}
                className="group/marker cursor-pointer focus:outline-none"
                role="button"
                tabIndex={0}
                aria-pressed={selected}
                aria-label={`${municipalityLabel(group)}. ${selected ? "Remover filtro de concelho." : "Filtrar concelho."}`}
                data-municipality={group.id}
                onClick={() => onSelect(group.id)}
                onKeyDown={(event) =>
                  activateOnKeyboard(event, () => onSelect(group.id))
                }
                onPointerEnter={() => onInspect(group.id)}
                onPointerLeave={() => onInspect(null)}
                onFocus={() => onInspect(group.id)}
                onBlur={() => onInspect(null)}
              >
                <title>{municipalityLabel(group)}</title>
                <circle
                  r={svgCoordinate(hitRadius)}
                  className="fill-transparent"
                />
                <circle
                  r={svgCoordinate(hitRadius + 3)}
                  className="fill-none stroke-primary stroke-2 opacity-0 group-focus-visible/marker:opacity-100"
                  aria-hidden="true"
                />
                <circle
                  r={svgCoordinate(radius)}
                  className={`${markerClass} stroke-2`}
                  strokeDasharray={possibleOnly ? "4 3" : undefined}
                  aria-hidden="true"
                />
                {group.assigned > 0 && group.possible > 0 && (
                  <circle
                    r={svgCoordinate(radius + 4)}
                    className={`fill-none stroke-1 ${selected ? "stroke-primary" : "stroke-stone-600"}`}
                    strokeDasharray="3 3"
                    aria-hidden="true"
                  />
                )}
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  className={`pointer-events-none fill-current text-xs font-semibold ${
                    possibleOnly
                      ? selected
                        ? "text-primary"
                        : "text-stone-800"
                      : "text-white"
                  }`}
                  aria-hidden="true"
                >
                  {label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {region.id === "madeira" && (
        <p className="text-xs text-stone-500">Inclui as ilhas Selvagens.</p>
      )}
    </section>
  );
}

export default function HeritageMap({
  geography,
  groups,
  selectedMunicipality,
  region,
  onSelect,
}: HeritageMapProps) {
  const [inspectedMunicipality, setInspectedMunicipality] = useState<
    string | null
  >(null);
  const municipalityIndex = useMemo(
    () => new Map(geography.municipalities.map((item) => [item.id, item])),
    [geography.municipalities]
  );
  const regionMunicipalities = useMemo(
    () =>
      REGION_ORDER.reduce(
        (result, id) => ({
          ...result,
          [id]: geography.municipalities.filter((item) => item.region === id),
        }),
        {} as Record<RegionId, GeographyMunicipality[]>
      ),
    [geography.municipalities]
  );
  const visibleRegions = REGION_ORDER.flatMap((id) => {
    const item = geography.regions.find((candidate) => candidate.id === id);
    return item && (region === "all" || region === id) ? [item] : [];
  });
  const inspectedGroup = groups.find(
    (group) => group.id === (inspectedMunicipality || selectedMunicipality)
  );
  const sourceUrl = safeMapSourceUrl(geography.provenance.serviceUrl);

  return (
    <figure
      className="@container"
      aria-label="Distribuição dos registos por concelho"
    >
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-stone-600">
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
            <circle cx="10" cy="10" r="7" className="fill-stone-800" />
          </svg>
          Contagem principal
        </span>
        <span className="inline-flex items-center gap-2">
          <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden="true">
            <circle
              cx="10"
              cy="10"
              r="7"
              className="fill-white stroke-stone-600 stroke-1"
              strokeDasharray="3 2"
            />
          </svg>
          ? = ano incerto
        </span>
      </div>
      <div
        className={
          region === "all" ? "grid gap-6 @2xl:grid-cols-2" : "grid gap-6"
        }
      >
        {visibleRegions.map((item) => (
          <RegionPanel
            key={item.id}
            region={item}
            municipalities={regionMunicipalities[item.id]}
            municipalityIndex={municipalityIndex}
            groups={groups}
            selectedMunicipality={selectedMunicipality}
            onSelect={onSelect}
            onInspect={setInspectedMunicipality}
            showAll={region === "all"}
          />
        ))}
      </div>
      <p
        className="!mt-4 min-h-12 text-sm leading-relaxed text-stone-600"
        aria-live="polite"
      >
        {inspectedGroup
          ? municipalityLabel(inspectedGroup)
          : "Seleccione um ponto ou um concelho para filtrar os registos."}
      </p>
      <figcaption className="space-y-2 border-t border-gray-200 pt-3 !text-xs !not-italic leading-relaxed text-stone-500">
        <p>
          Pontos agregados por concelho, sem localização exacta dos edifícios.
          As linhas ligam os marcadores deslocados a um ponto de referência
          dentro do concelho.
        </p>
        <p>
          Cada painel tem escala própria. A distância entre painéis não é
          geográfica.
        </p>
        <p>
          Cartografia:{" "}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary-dark"
            >
              {geography.provenance.provider}, Carta Administrativa Oficial de
              Portugal
            </a>
          ) : (
            `${geography.provenance.provider}, Carta Administrativa Oficial de Portugal`
          )}
          . Geometrias simplificadas para visualização.
        </p>
      </figcaption>
    </figure>
  );
}
