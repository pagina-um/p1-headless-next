"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  BASE,
  EMPTY_FILTERS,
  GROUPS,
  PHASES,
  filterIndex,
  filterParams,
  formatDate,
  phaseFor,
  readFilters,
} from "../_lib/archive";
import type { CaseIndex, Filters, Party } from "../_lib/types";
import { ContextNote, Downloads, control } from "./Common";

export function CaseList({
  records,
  parties,
  initial,
  color,
  chronology = false,
}: {
  records: CaseIndex[];
  parties: Pick<Party, "id" | "name" | "abbr">[];
  initial: Filters;
  color: string;
  chronology?: boolean;
}) {
  const [filters, setFilters] = useState(initial);
  const [page, setPage] = useState(1);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const result = useMemo(
    () => filterIndex(records, filters),
    [records, filters]
  );
  const size = 12;
  const pages = Math.max(1, Math.ceil(result.length / size));
  const currentPage = Math.min(page, pages);
  const shown = result.slice((currentPage - 1) * size, currentPage * size);
  const years = useMemo(
    () => Array.from(new Set(records.map((r) => r.year))).sort((a, b) => b - a),
    [records]
  );
  const natures = useMemo(
    () => Array.from(new Set(records.map((r) => r.nature))).sort(),
    [records]
  );
  const phaseCounts = useMemo(
    () =>
      PHASES.map((phase) => ({
        phase,
        count: records.filter(
          (r) =>
            phaseFor(r, filters.party) === phase &&
            (!filters.party ||
              (filters.party === "independentes"
                ? !r.parties.length
                : r.parties.includes(filters.party)))
        ).length,
      })),
    [records, filters.party]
  );
  useEffect(() => {
    const onBack = () => {
      setFilters(readFilters(new URLSearchParams(window.location.search)));
      setPage(1);
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  }, []);
  function change(patch: Partial<Filters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    setPage(1);
    const params = filterParams(next).toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${params ? `?${params}` : ""}`
    );
  }
  const partyName = (id: string) =>
    parties.find((p) => p.id === id)?.abbr || id;
  const goPage = (value: number) => {
    setPage(value);
    resultsHeading.current?.focus();
  };
  return (
    <>
      {!chronology && (
        <div
          className="my-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          role="group"
          aria-label="Filtrar por fase ou desfecho"
        >
          {phaseCounts
            .filter((p) => p.count > 0)
            .map(({ phase, count }) => (
              <button
                key={phase}
                type="button"
                aria-pressed={filters.phase === phase}
                onClick={() =>
                  change({
                    phase: filters.phase === phase ? "" : phase,
                    group: "",
                  })
                }
                className="flex min-w-0 items-center gap-3 rounded-md border border-gray-200 bg-white p-4 text-left hover:shadow-sm"
                style={
                  filters.phase === phase
                    ? { borderColor: color, backgroundColor: `${color}0a` }
                    : undefined
                }
              >
                <strong className="font-serif text-3xl" style={{ color }}>
                  {count}
                </strong>
                <span className="text-sm leading-snug">{phase}</span>
              </button>
            ))}
        </div>
      )}
      <section
        aria-labelledby="filters-title"
        className="my-8 rounded-md border border-gray-200 bg-white p-5"
      >
        <h2 id="filters-title">Filtrar o arquivo</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">
            Palavra-chave
            <input
              type="search"
              value={filters.q}
              onChange={(e) => change({ q: e.target.value })}
              className={`${control} mt-2`}
              placeholder="Nome, assunto, local ou processo…"
            />
          </label>
          <label className="text-sm font-medium">
            Partido ou percurso
            <select
              className={`${control} mt-2`}
              value={filters.party}
              onChange={(e) => change({ party: e.target.value })}
            >
              <option value="">Todos os partidos</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.abbr} — {p.name}
                </option>
              ))}
              <option value="independentes">Sem partido associado</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Fase ou desfecho
            <select
              className={`${control} mt-2`}
              value={filters.phase}
              onChange={(e) => change({ phase: e.target.value, group: "" })}
            >
              <option value="">Todos os desfechos</option>
              {PHASES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Natureza
            <select
              className={`${control} mt-2`}
              value={filters.nature}
              onChange={(e) => change({ nature: e.target.value })}
            >
              <option value="">Todas as naturezas</option>
              {natures.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Ano de referência
            <select
              className={`${control} mt-2`}
              value={filters.year}
              onChange={(e) => change({ year: e.target.value })}
            >
              <option value="">Todos os anos</option>
              {years.map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Ordenar
            <select
              className={`${control} mt-2`}
              value={filters.sort}
              onChange={(e) => change({ sort: e.target.value })}
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigos primeiro</option>
              <option value="alpha">Título — ordem alfabética</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inquest}
              onChange={(e) => change({ inquest: e.target.checked })}
            />
            Arguidos em inquérito
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.mandate}
              onChange={(e) => change({ mandate: e.target.checked })}
            />
            Processos administrativos de perda de mandato
          </label>
          <button
            type="button"
            onClick={() => change(EMPTY_FILTERS)}
            className="text-primary underline underline-offset-4"
          >
            Limpar filtros
          </button>
        </div>
        {filters.inquest && (
          <p className="text-sm text-stone-600">
            Casos com pelo menos uma pessoa constituída arguida, com fonte e
            data, em fase de investigação. Este estatuto não constitui acusação
            nem prova de culpa.
          </p>
        )}
        {filters.group && (
          <p className="text-sm">
            Grupo da síntese:{" "}
            <strong>
              {GROUPS.find((g) => g.id === filters.group)?.label ||
                filters.group}
            </strong>{" "}
            ·{" "}
            <button
              className="text-primary underline"
              onClick={() => change({ group: "" })}
            >
              Retirar
            </button>
          </p>
        )}
        {filters.category && (
          <p className="text-sm">
            Selecção: {filters.category} ·{" "}
            <button
              className="text-primary underline"
              onClick={() => change({ category: "" })}
            >
              Incluir todos os registos
            </button>
          </p>
        )}
      </section>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2
          ref={resultsHeading}
          tabIndex={-1}
          className="scroll-mt-28"
          aria-live="polite"
        >
          {result.length}{" "}
          {result.length === 1 ? "ficha encontrada" : "fichas encontradas"}
        </h2>
        <Downloads query={filterParams(filters).toString()} />
      </div>
      <div className="space-y-4">
        {shown.map((r) => (
          <article
            key={r.id}
            className={`min-w-0 rounded-md border border-gray-200 bg-white p-5 shadow-sm ${chronology ? "md:grid md:grid-cols-[12rem_1fr] md:gap-6" : ""}`}
          >
            <div
              className={
                chronology
                  ? "mb-3 text-sm text-stone-500"
                  : "mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500"
              }
            >
              <time dateTime={r.dateLabel || undefined}>
                {r.dateLabel
                  ? formatDate(r.dateLabel)
                  : `Exercício de ${r.year}`}
              </time>
              <span className={chronology ? "mt-1 block" : ""}>
                {r.dateKind}
              </span>
              <span className={chronology ? "mt-1 block" : ""}>{r.nature}</span>
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-2">
                {r.parties.map((p) => (
                  <Link
                    key={p}
                    href={`${BASE}/casos?p=${encodeURIComponent(p)}`}
                    className="rounded bg-gray-100 px-2 py-1 text-xs text-stone-600"
                  >
                    {partyName(p)}
                  </Link>
                ))}
                {!r.parties.length && (
                  <span className="text-xs text-stone-500">
                    Sem partido associado
                  </span>
                )}
              </div>
              <h3>
                <Link
                  href={`${BASE}/casos/${r.id}`}
                  className="hover:underline"
                >
                  {r.title}
                </Link>
              </h3>
              <p className="text-sm font-semibold" style={{ color }}>
                {phaseFor(r, filters.party)}
              </p>
              <p>{r.summary}</p>
              <p className="text-sm text-stone-600">{r.status}</p>
              {!!r.people.length && (
                <div
                  className="mt-4 flex flex-wrap gap-2"
                  aria-label="Pessoas desta ficha"
                >
                  {r.people.map((p) => (
                    <Link
                      key={p.id}
                      href={`${BASE}/pessoas/${p.id}`}
                      className="rounded-full border border-gray-200 px-3 py-1 text-sm text-primary hover:bg-gray-50"
                    >
                      {p.name}
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={`${BASE}/casos/${r.id}`}
                className="mt-4 inline-block text-sm text-primary underline underline-offset-4"
              >
                Abrir ficha, histórico e fontes
              </Link>
            </div>
          </article>
        ))}
      </div>
      {!result.length && (
        <p className="rounded-md border border-gray-200 bg-white p-6">
          Nenhuma ficha corresponde a esta combinação. Altere ou limpe os
          filtros.
        </p>
      )}
      <nav
        aria-label="Paginação das fichas"
        className="my-6 flex flex-wrap items-center justify-center gap-4 text-sm"
      >
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
          disabled={currentPage === 1}
          onClick={() => goPage(currentPage - 1)}
        >
          Anterior
        </button>
        <span>
          Página {currentPage} de {pages}
        </span>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
          disabled={currentPage === pages}
          onClick={() => goPage(currentPage + 1)}
        >
          Seguinte
        </button>
      </nav>
      <ContextNote />
    </>
  );
}
