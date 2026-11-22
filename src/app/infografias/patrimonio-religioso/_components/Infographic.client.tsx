"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Pause,
  Play,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { groupMunicipalities, select, series, YEARS } from "../_lib/timeline";
import {
  filterHash,
  humanDate,
  INITIAL_FILTERS,
  readFilters,
  selectionCsv,
} from "../_lib/presentation";
import type {
  FilterState,
  InfographicData,
  RegionFilter,
  Universe,
} from "../_lib/types";
import { AnnualChart } from "./AnnualChart";
import HeritageMap from "./HeritageMap";
import { Methodology } from "./Methodology";
import { RecordCard } from "./RecordCard";

interface InfographicProps extends InfographicData {
  presentation?: "page" | "inline";
}

const PAGE_SIZE = 6;
const SELECT_CLASS =
  "mt-2 block min-h-11 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function Infographic({
  records,
  geography,
  categories,
  metadata,
  presentation = "inline",
}: InfographicProps) {
  const compact = presentation === "inline";
  const Heading = presentation === "inline" ? "h2" : "h1";
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [openRecord, setOpenRecord] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4000);
  const [restored, setRestored] = useState(false);
  const resultsRef = useRef<HTMLHeadingElement>(null);
  const data = useMemo(
    () => ({ records, geography, categories, metadata }),
    [records, geography, categories, metadata]
  );

  useEffect(() => {
    // An inline piece must not replace the article's own fragment links.
    if (presentation === "inline") {
      setRestored(true);
      return;
    }
    const restore = () => {
      setFilters(readFilters(window.location.hash, data));
      setPage(1);
      setOpenRecord(null);
      setPlaying(false);
      setRestored(true);
    };
    restore();
    window.addEventListener("hashchange", restore);
    return () => window.removeEventListener("hashchange", restore);
  }, [data, presentation]);

  useEffect(() => {
    if (!restored || presentation === "inline") return;
    const hash = filterHash(filters);
    if (window.location.hash !== `#${hash}`) {
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}#${hash}`
      );
    }
  }, [filters, restored, presentation]);

  useEffect(() => {
    if (!playing) return;
    if (filters.year >= 2026) {
      setPlaying(false);
      return;
    }
    const timeout = window.setTimeout(() => {
      setFilters((previous) => ({
        ...previous,
        year: Math.min(2026, previous.year + 1),
      }));
      setPage(1);
      setOpenRecord(null);
    }, speed);
    return () => window.clearTimeout(timeout);
  }, [playing, speed, filters.year]);

  useEffect(() => {
    const pauseWhenHidden = () => {
      if (document.hidden) setPlaying(false);
    };
    document.addEventListener("visibilitychange", pauseWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", pauseWhenHidden);
  }, []);

  const selection = useMemo(() => select(records, filters), [records, filters]);
  const points = useMemo(() => series(records, filters), [records, filters]);
  const groups = useMemo(
    () => groupMunicipalities(selection.visible),
    [selection.visible]
  );
  const totalPages = Math.max(
    1,
    Math.ceil(selection.visible.length / PAGE_SIZE)
  );
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visiblePage = selection.visible.slice(start, start + PAGE_SIZE);
  const uncertain = selection.possible.length + selection.undated.length;
  const shownUncertain = filters.showUncertain ? uncertain : 0;
  const siteCount = new Set(
    selection.visible.map((item) => item.record.siteId).filter(Boolean)
  ).size;
  const activeCategory = categories[filters.universe].find(
    (item) => item.id === filters.category
  );
  const activeMunicipality = geography.municipalities.find(
    (item) => item.id === filters.municipality
  );
  const universeMunicipalities = useMemo(
    () =>
      new Set(
        records
          .filter((record) => record.universe === filters.universe)
          .map((record) => record.municipalityId)
          .filter(Boolean)
      ).size,
    [records, filters.universe]
  );

  function change(patch: Partial<FilterState>) {
    setPlaying(false);
    setPage(1);
    setOpenRecord(null);
    setFilters((previous) => ({ ...previous, ...patch }));
  }

  function switchUniverse(universe: Universe) {
    change({ universe, category: "all", municipality: null });
  }

  function togglePlayback() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (filters.year === 2026)
      setFilters((previous) => ({ ...previous, year: 2022 }));
    setPage(1);
    setOpenRecord(null);
    setPlaying(true);
  }

  function goToPage(next: number) {
    setPlaying(false);
    setOpenRecord(null);
    setPage(next);
    resultsRef.current?.focus({ preventScroll: true });
  }

  function download() {
    setPlaying(false);
    const url = URL.createObjectURL(
      new Blob([selectionCsv(selection.visible)], {
        type: "text/csv;charset=utf-8",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `pagina_um_${filters.universe}_${filters.year}_${filters.mode === "period" ? "periodo" : "acumulado"}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section
      id="patrimonio-infografia"
      className={`w-full text-stone-900 ${compact ? "px-4 py-6" : ""}`}
    >
      <div className="max-w-3xl">
        <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
          Infografia · Portugal · 2022–2026
        </p>
        <Heading
          className={`mt-3 font-serif !font-bold !leading-tight ${compact ? "!text-2xl md:!text-3xl" : "text-4xl md:text-6xl"}`}
        >
          O património atingido, lugar a lugar, ano a ano
        </Heading>
        <p className="!mt-5 text-base leading-relaxed text-stone-700 md:text-lg">
          Explore os registos reunidos pelo PÁGINA UM. Escolha um ano e uma
          tipologia, acompanhe o mapa e consulte o relato e as fontes de cada
          caso.
        </p>
        <p className="!mt-3 text-sm leading-relaxed text-stone-500">
          Levantamento até <strong>{humanDate(metadata.dataCutoff)}</strong> ·
          Cobertura documental não exaustiva
        </p>
      </div>

      <section className="mt-8" aria-label="Explorar os registos">
        <div
          className="grid gap-3 sm:grid-cols-2"
          role="group"
          aria-label="Universo documental"
        >
          {(
            [
              ["igrejas", "Igrejas e património"],
              ["cemiterios", "Cemitérios"],
            ] as const
          ).map(([universe, label]) => (
            <Button
              key={universe}
              type="button"
              variant="outline"
              aria-pressed={filters.universe === universe}
              onClick={() => switchUniverse(universe)}
              className={`h-auto min-h-11 justify-between whitespace-normal px-4 py-3 text-left motion-reduce:transition-none ${filters.universe === universe ? "border-primary text-primary" : "border-gray-300 text-stone-700"}`}
            >
              <span>{label}</span>
              <strong className="font-serif text-2xl">
                {metadata.countsByUniverse[universe]}
              </strong>
            </Button>
          ))}
        </div>
        <p className="!mt-3 text-sm leading-relaxed text-stone-600">
          {filters.universe === "igrejas"
            ? `${metadata.countsByUniverse.igrejas} registos sobre igrejas, capelas, património católico e sacerdotes, em ${universeMunicipalities} concelhos. Inclui suspeitas, tentativas e desaparecimentos.`
            : `${metadata.countsByUniverse.cemiterios} registos em ${metadata.cemeterySiteCount} cemitérios, de ${universeMunicipalities} concelhos. Este universo inclui recintos municipais e de outras tradições religiosas.`}
        </p>

        <div className="mt-6 rounded-md border border-gray-200 bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label
              htmlFor="heritage-category"
              className="min-w-0 text-sm font-medium text-stone-700"
            >
              Tipologia principal
              <select
                id="heritage-category"
                value={filters.category}
                onChange={(event) => {
                  const category = categories[filters.universe].find(
                    (item) => item.id === event.target.value
                  );
                  change({ category: category?.id ?? "all" });
                }}
                className={SELECT_CLASS}
              >
                <option value="all">Todas as tipologias</option>
                {categories[filters.universe].map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>
            <label
              htmlFor="heritage-search"
              className="min-w-0 text-sm font-medium text-stone-700"
            >
              Pesquisar
              <Input
                id="heritage-search"
                type="search"
                autoComplete="off"
                maxLength={200}
                placeholder="Concelho, igreja ou palavra…"
                value={filters.query}
                onChange={(event) => change({ query: event.target.value })}
                className="mt-2 h-11 border-gray-300 bg-white focus-visible:ring-primary"
              />
            </label>
            <label
              htmlFor="heritage-region"
              className="min-w-0 text-sm font-medium text-stone-700"
            >
              Território
              <select
                id="heritage-region"
                value={filters.region}
                onChange={(event) =>
                  change({
                    region: event.target.value as RegionFilter,
                    municipality: null,
                  })
                }
                className={SELECT_CLASS}
              >
                <option value="all">Portugal</option>
                <option value="continente">Continente</option>
                <option value="acores">Açores</option>
                <option value="madeira">Madeira</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                change({
                  category: "all",
                  query: "",
                  region: "all",
                  municipality: null,
                })
              }
              className="border-gray-300 text-stone-700"
            >
              Limpar filtros
            </Button>
            {activeMunicipality && (
              <Button
                type="button"
                variant="outline"
                className="h-auto min-h-10 whitespace-normal border-primary text-primary"
                onClick={() => change({ municipality: null })}
              >
                {activeMunicipality.name}
                <X size={14} aria-hidden="true" />
                <span className="sr-only">Retirar filtro de concelho</span>
              </Button>
            )}
          </div>
          <p className="!mt-4 text-sm leading-relaxed text-stone-600">
            {activeCategory?.definition ??
              "Uma categoria principal por registo. Os danos também podem acompanhar furtos e tentativas."}
          </p>
        </div>

        <section
          className="mt-6 rounded-md border border-gray-200 bg-white p-5"
          aria-label="Cronologia interactiva"
        >
          <div
            className="flex flex-wrap gap-3"
            role="group"
            aria-label="Modo temporal"
          >
            <Button
              type="button"
              variant="outline"
              aria-pressed={filters.mode === "period"}
              onClick={() => change({ mode: "period" })}
              className={
                filters.mode === "period"
                  ? "border-primary text-primary"
                  : "border-gray-300 text-stone-700"
              }
            >
              Registos do ano
            </Button>
            <Button
              type="button"
              variant="outline"
              aria-pressed={filters.mode === "cumulative"}
              onClick={() => change({ mode: "cumulative" })}
              className={`h-auto min-h-10 whitespace-normal ${filters.mode === "cumulative" ? "border-primary text-primary" : "border-gray-300 text-stone-700"}`}
            >
              Acumulado desde 2022
            </Button>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-[10rem_minmax(0,1fr)]">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                {filters.mode === "period"
                  ? "Ano seleccionado"
                  : "Acumulado até"}
              </p>
              <p
                className="!mt-2 font-serif text-4xl font-bold md:text-6xl"
                data-testid="selected-year"
              >
                {filters.year}
              </p>
              <p className="!mt-2 text-sm text-stone-600">
                {filters.year === 2026 ? "Até 19 de Novembro" : "Etapa anual"}
              </p>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={togglePlayback}
                  aria-pressed={playing}
                  className="bg-primary text-white hover:bg-primary-dark motion-reduce:transition-none"
                >
                  {playing ? (
                    <Pause aria-hidden="true" />
                  ) : (
                    <Play aria-hidden="true" />
                  )}
                  {playing ? "Pausar" : "Reproduzir"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ano anterior"
                  disabled={filters.year <= 2022}
                  onClick={() => change({ year: filters.year - 1 })}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ano seguinte"
                  disabled={filters.year >= 2026}
                  onClick={() => change({ year: filters.year + 1 })}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
                <label
                  htmlFor="heritage-speed"
                  className="flex items-center gap-2 text-xs text-stone-600"
                >
                  Ritmo
                  <select
                    id="heritage-speed"
                    aria-label="Tempo por ano"
                    value={speed}
                    onChange={(event) => {
                      setPlaying(false);
                      setSpeed(Number(event.target.value));
                    }}
                    className="min-h-10 rounded-md border border-gray-300 bg-white px-2 text-sm focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value={2500}>2,5 s / ano</option>
                    <option value={4000}>4 s / ano</option>
                    <option value={6000}>6 s / ano</option>
                  </select>
                </label>
              </div>
              <label htmlFor="heritage-year" className="sr-only">
                Ano seleccionado
              </label>
              <input
                id="heritage-year"
                type="range"
                min={2022}
                max={2026}
                step={1}
                value={filters.year}
                onChange={(event) =>
                  change({ year: Number(event.target.value) })
                }
                className="mt-5 block w-full accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
              <div
                className="mt-3 grid grid-cols-5 gap-1"
                role="group"
                aria-label="Escolher ano"
              >
                {YEARS.map((year) => (
                  <Button
                    key={year}
                    type="button"
                    variant="ghost"
                    onClick={() => change({ year })}
                    aria-pressed={filters.year === year}
                    className={`min-w-0 px-1 ${filters.year === year ? "bg-gray-100 font-bold text-primary" : "text-stone-600"}`}
                  >
                    {year}
                  </Button>
                ))}
              </div>
              <p
                role="status"
                className="!mt-3 text-xs leading-relaxed text-stone-500"
              >
                {playing
                  ? "Reprodução por etapas anuais. Pode pausar a qualquer momento."
                  : filters.year === 2026
                    ? "Fim da sequência: dados até 19 de Novembro de 2026."
                    : "Escolha um ano ou reproduza a sequência."}
              </p>
            </div>
          </div>
          <p className="!mt-5 border-t border-gray-200 pt-4 text-sm leading-relaxed text-stone-600">
            {filters.mode === "period"
              ? "A contagem principal inclui os registos atribuídos ao ano seleccionado. Os intervalos entre anos aparecem à parte, quando compatíveis com esta etapa."
              : "Cada registo entra uma única vez quando o final do seu intervalo temporal fica abrangido. O crescimento deste acumulado não demonstra um aumento da frequência dos acontecimentos."}
          </p>
        </section>

        <dl
          className={`mt-6 grid grid-cols-2 gap-3 ${filters.universe === "cemiterios" ? "lg:grid-cols-4" : "sm:grid-cols-3"}`}
          aria-live="polite"
          aria-atomic="true"
        >
          {[
            {
              label: "Contagem principal",
              value: selection.assigned.length,
              testId: "principal-count",
            },
            {
              label: "Ano incerto compatível",
              value: uncertain,
              testId: "uncertain-count",
            },
            {
              label: "Concelhos visíveis",
              value: groups.length,
              testId: "municipality-count",
            },
            ...(filters.universe === "cemiterios"
              ? [
                  {
                    label: "Locais distintos",
                    value: siteCount,
                    testId: "site-count",
                  },
                ]
              : []),
          ].map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-md border border-gray-200 bg-white p-4"
            >
              <dt className="text-[11px] font-medium uppercase tracking-wider text-stone-500">
                {stat.label}
              </dt>
              <dd
                className="mt-2 font-serif text-3xl font-bold text-stone-900"
                data-testid={stat.testId}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 text-sm leading-relaxed text-stone-600">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={filters.showUncertain}
              onChange={(event) =>
                change({ showUncertain: event.target.checked })
              }
              className="mt-1 h-4 w-4 shrink-0 accent-primary"
            />
            <span>
              Mostrar também os registos com ano incerto compatível com esta
              etapa
            </span>
          </label>
          <p className="!mt-2">
            {uncertain
              ? `${uncertain} ${uncertain === 1 ? "registo não entra" : "registos não entram"} na contagem principal desta etapa.${filters.showUncertain ? (uncertain === 1 ? " Surge à parte no mapa e nas fichas." : " Surgem à parte no mapa e nas fichas.") : uncertain === 1 ? " Oculto no mapa e nas fichas." : " Ocultos no mapa e nas fichas."}`
              : "Nenhum intervalo entre anos acrescenta registos possíveis a esta selecção."}
          </p>
        </div>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-2">
          <section className="min-w-0" aria-labelledby="map-title">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2
                id="map-title"
                className="font-serif !text-2xl !font-bold md:!text-3xl"
              >
                Onde estão os registos
              </h2>
              {filters.municipality && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto whitespace-normal p-0 text-primary"
                  onClick={() => change({ municipality: null })}
                >
                  Ver todos os concelhos
                </Button>
              )}
            </div>
            <p className="!mt-3 text-sm leading-relaxed text-stone-600">
              Seleccione um concelho para filtrar os registos. Escolha um
              território para ampliar a cartografia.
            </p>
            <HeritageMap
              geography={geography}
              groups={groups}
              selectedMunicipality={filters.municipality ?? ""}
              region={filters.region}
              onSelect={(id) =>
                change({
                  municipality: filters.municipality === id ? null : id,
                })
              }
            />
            <AnnualChart
              points={points}
              year={filters.year}
              mode={filters.mode}
              showUncertain={filters.showUncertain}
              onSelect={(year) => change({ year })}
            />
          </section>
          <section className="min-w-0" aria-labelledby="results-title">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2
                id="results-title"
                ref={resultsRef}
                tabIndex={-1}
                className="font-serif !text-2xl !font-bold outline-none md:!text-3xl"
              >
                Os relatos e as fontes
              </h2>
              <span
                className="text-sm text-stone-500"
                data-testid="result-count"
              >
                {selection.visible.length}{" "}
                {selection.visible.length === 1 ? "ficha" : "fichas"}
              </span>
            </div>
            <p className="!mt-3 text-sm leading-relaxed text-stone-600">
              {selection.assigned.length}{" "}
              {selection.assigned.length === 1 ? "registo" : "registos"} na
              contagem principal
              {shownUncertain
                ? ` e ${shownUncertain} com atribuição temporal incerta`
                : ""}
              .
              {filters.universe === "cemiterios"
                ? ` A selecção abrange ${siteCount} ${siteCount === 1 ? "local distinto" : "locais distintos"}.`
                : ""}{" "}
              Abra uma ficha para ler os pormenores e consultar as fontes.
            </p>
            <div className="mt-5 space-y-4">
              {visiblePage.length ? (
                visiblePage.map((item) => (
                  <RecordCard
                    key={item.record.id}
                    item={item}
                    mode={filters.mode}
                    open={openRecord === item.record.id}
                    onToggle={() => {
                      setPlaying(false);
                      setOpenRecord((previous) =>
                        previous === item.record.id ? null : item.record.id
                      );
                    }}
                  />
                ))
              ) : (
                <div className="rounded-md border border-gray-200 bg-white p-5 text-sm leading-relaxed text-stone-600">
                  <strong className="block text-stone-900">
                    Nenhum registo nesta selecção.
                  </strong>
                  Experimente outro ano, outra tipologia ou limpe a pesquisa e o
                  filtro de concelho.
                </div>
              )}
            </div>
            {selection.visible.length > PAGE_SIZE && (
              <nav
                className="mt-5 flex flex-wrap items-center justify-between gap-3"
                aria-label="Páginas dos registos"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anteriores
                </Button>
                <span className="text-xs text-stone-600">
                  {start + 1}–
                  {Math.min(start + PAGE_SIZE, selection.visible.length)} de{" "}
                  {selection.visible.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Seguintes
                </Button>
              </nav>
            )}
          </section>
        </div>

        <section
          className="mt-8 border-t border-gray-200 pt-6"
          aria-label="Método e dados"
        >
          <Methodology onInteract={() => setPlaying(false)} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-stone-500">
              Fontes individuais nas fichas · Corte documental:{" "}
              {humanDate(metadata.dataCutoff)}
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={download}
              disabled={selection.visible.length === 0}
              className="h-auto min-h-10 whitespace-normal border-gray-300 text-stone-700"
            >
              <Download aria-hidden="true" />
              Descarregar esta selecção em CSV
            </Button>
          </div>
        </section>
      </section>
      <noscript>
        <p className="!mt-5 rounded-md border border-gray-300 bg-white p-4 text-sm">
          Active o JavaScript para usar os filtros, o mapa e a cronologia. As
          fichas apresentadas correspondem à selecção inicial de 2022.
        </p>
      </noscript>
    </section>
  );
}
