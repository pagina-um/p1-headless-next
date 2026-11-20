"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BASE, formatDate, normalize } from "../_lib/archive";
import type { Party, Person } from "../_lib/types";
import { Portrait, SourceLink, control } from "./Common";

export function PartyDirectory({
  parties,
  counts,
}: {
  parties: Party[];
  counts: Record<string, number>;
}) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("registration");
  const result = useMemo(
    () =>
      parties
        .filter((p) => normalize(`${p.name} ${p.abbr}`).includes(normalize(q)))
        .sort((a, b) =>
          sort === "alpha"
            ? a.name.localeCompare(b.name, "pt")
            : (a.registered || "9999").localeCompare(b.registered || "9999") ||
              a.name.localeCompare(b.name, "pt")
        ),
    [parties, q, sort]
  );
  return (
    <>
      <div className="my-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Pesquisar partido
          <input
            type="search"
            className={`${control} mt-2`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome ou sigla…"
          />
        </label>
        <label className="text-sm font-medium">
          Ordenação
          <select
            className={`${control} mt-2`}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="registration">
              Inscrição no Tribunal Constitucional — mais antiga primeiro
            </option>
            <option value="alpha">Ordem alfabética do nome</option>
          </select>
        </label>
      </div>
      <p aria-live="polite" className="text-sm text-stone-500">
        {result.length}{" "}
        {result.length === 1 ? "partido encontrado" : "partidos encontrados"}
      </p>
      {[false, true]
        .filter((historical) => result.some((p) => p.historical === historical))
        .map((historical) => (
          <section className="mt-8" key={String(historical)}>
            <h2>
              {historical
                ? "Partidos históricos"
                : "Partidos actuais no directório"}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {result
                .filter((p) => p.historical === historical)
                .map((p) => (
                  <article
                    key={p.id}
                    className="flex min-w-0 flex-col rounded-md border border-gray-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="min-w-0 break-words">
                        <Link
                          href={`${BASE}/casos?p=${encodeURIComponent(p.id)}`}
                          className="hover:underline"
                        >
                          {p.abbr}
                        </Link>
                      </h3>
                      {p.logo && (
                        <Image
                          src={p.logo.src}
                          alt={`Símbolo de ${p.name}`}
                          width={64}
                          height={64}
                          className="h-14 w-16 shrink-0 object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                    <p className="grow">{p.name}</p>
                    <p className="text-sm text-stone-500">
                      Inscrição · {formatDate(p.registered)}
                      {p.extinguished && (
                        <>
                          <br />
                          Extinção · {formatDate(p.extinguished)}
                        </>
                      )}
                    </p>
                    <div className="mt-3 border-t border-gray-200 pt-3">
                      <Link
                        href={`${BASE}/casos?c=Casos&p=${encodeURIComponent(p.id)}`}
                        className="text-primary underline underline-offset-4"
                      >
                        {counts[p.id]
                          ? `${counts[p.id]} ${counts[p.id] === 1 ? "caso catalogado" : "casos catalogados"}`
                          : "Sem casos catalogados"}
                      </Link>
                      <details className="mt-3 text-sm text-stone-500">
                        <summary className="cursor-pointer">
                          Registo e origem do símbolo
                        </summary>
                        <p>
                          <SourceLink source={p.source} />
                        </p>
                        {p.logo && (
                          <p>
                            <SourceLink source={p.logo.source} />
                            {p.logo.author && <> · {p.logo.author}</>}
                            {p.logo.license && (
                              <>
                                {" "}
                                ·{" "}
                                <a
                                  href={p.logo.licenseUrl}
                                  className="underline"
                                >
                                  {p.logo.license}
                                </a>
                              </>
                            )}
                            {p.logo.changes && <> · {p.logo.changes}</>}
                          </p>
                        )}
                      </details>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        ))}
      {!result.length && <p>Nenhum partido corresponde à pesquisa.</p>}
    </>
  );
}

export function PeopleDirectory({ people }: { people: Person[] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const result = useMemo(
    () =>
      people.filter((p) =>
        normalize([p.name, ...p.fullNames].join(" ")).includes(normalize(q))
      ),
    [people, q]
  );
  const pages = Math.max(1, Math.ceil(result.length / 24));
  const current = Math.min(page, pages);
  return (
    <>
      <label className="my-6 block max-w-xl text-sm font-medium">
        Pesquisar pessoa
        <input
          type="search"
          className={`${control} mt-2`}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Nome…"
        />
      </label>
      <p aria-live="polite" className="text-sm text-stone-500">
        {result.length} {result.length === 1 ? "pessoa" : "pessoas"} no registo
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {result.slice((current - 1) * 24, current * 24).map((p) => (
          <article
            key={p.id}
            className="flex min-w-0 items-start gap-4 rounded-md border border-gray-200 bg-white p-5 shadow-sm"
          >
            <Link
              href={`${BASE}/pessoas/${p.id}`}
              tabIndex={-1}
              aria-hidden="true"
            >
              <Portrait person={p} compact />
            </Link>
            <div className="min-w-0">
              <h3>
                <Link
                  href={`${BASE}/pessoas/${p.id}`}
                  className="hover:underline"
                >
                  {p.name}
                </Link>
              </h3>
              <p className="text-sm text-stone-600">
                {p.recordIds.length}{" "}
                {p.recordIds.length === 1
                  ? "ficha associada"
                  : "fichas associadas"}
              </p>
              <Link
                href={`${BASE}/pessoas/${p.id}`}
                className="text-sm text-primary underline underline-offset-4"
              >
                Consultar ficha individual
              </Link>
              {p.portrait && (
                <p className="text-xs text-stone-500">
                  Foto: {p.portrait.credit} · créditos e licença na ficha
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
      {!result.length && <p>Nenhuma pessoa corresponde à pesquisa.</p>}
      <nav
        aria-label="Paginação das pessoas"
        className="my-6 flex flex-wrap items-center justify-center gap-4 text-sm"
      >
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
          disabled={current === 1}
          onClick={() => setPage(current - 1)}
        >
          Anterior
        </button>
        <span>
          Página {current} de {pages}
        </span>
        <button
          className="rounded-md border border-gray-300 bg-white px-4 py-2 disabled:opacity-40"
          disabled={current === pages}
          onClick={() => setPage(current + 1)}
        >
          Seguinte
        </button>
      </nav>
    </>
  );
}
