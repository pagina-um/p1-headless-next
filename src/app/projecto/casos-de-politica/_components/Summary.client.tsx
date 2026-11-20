"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { BASE, GROUPS, normalize, type SummaryRow } from "../_lib/archive";
import { control } from "./Common";

export function Summary({ rows }: { rows: SummaryRow[] }) {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("total");
  const visible = useMemo(
    () =>
      rows
        .filter((p) => normalize(`${p.name} ${p.abbr}`).includes(normalize(q)))
        .sort((a, b) =>
          sort === "alpha"
            ? a.abbr.localeCompare(b.abbr, "pt")
            : b.total - a.total || a.abbr.localeCompare(b.abbr, "pt")
        ),
    [q, sort, rows]
  );
  const href = (id: string, group = "") =>
    `${BASE}/casos?c=Casos&p=${encodeURIComponent(id)}${group ? `&g=${group}` : ""}`;
  return (
    <section aria-labelledby="summary-title" className="mt-10 min-w-0">
      <h2 id="summary-title">Síntese por partido</h2>
      <p>
        A ordenação inicial segue o total de casos, do maior para o menor. Cada
        número abre as fichas correspondentes. Um processo com vários partidos
        conta uma vez em cada linha, pelo que a soma das linhas pode exceder o
        total de casos únicos.
      </p>
      <div className="my-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">
          Pesquisar partido
          <input
            className={`${control} mt-2`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome ou sigla…"
            type="search"
          />
        </label>
        <label className="text-sm font-medium">
          Ordenar
          <select
            className={`${control} mt-2`}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="total">Número de casos — maior primeiro</option>
            <option value="alpha">Ordem alfabética</option>
          </select>
        </label>
      </div>
      <p className="text-sm text-stone-500">
        No telemóvel, deslize a tabela para consultar todos os desfechos.
      </p>
      <div
        className="max-w-full overflow-x-auto rounded-md border border-gray-200 bg-white"
        tabIndex={0}
        role="region"
        aria-label="Tabela de casos por partido"
      >
        <table className="w-full min-w-[960px] text-left text-sm">
          <caption className="sr-only">
            Casos catalogados por partido e desfecho documentado
          </caption>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="p-4">
                Partido
              </th>
              <th scope="col" className="p-4 text-right">
                Total
              </th>
              {GROUPS.map((g) => (
                <th scope="col" key={g.id} className="max-w-40 p-4 text-right">
                  {g.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id} className="border-t border-gray-200">
                <th scope="row" className="p-4 font-normal">
                  <Link
                    href={href(p.id)}
                    className="font-semibold text-primary underline underline-offset-4"
                  >
                    {p.abbr}
                  </Link>
                  <span className="mt-1 block max-w-60 text-xs text-stone-500">
                    {p.name}
                    {p.historical ? " · histórico" : ""}
                  </span>
                </th>
                <td className="p-4 text-right font-bold tabular-nums">
                  <Link
                    href={href(p.id)}
                    className="text-primary underline"
                    aria-label={`${p.abbr}: ${p.total} ${p.total === 1 ? "caso" : "casos"}`}
                  >
                    {p.total}
                  </Link>
                </td>
                {GROUPS.map((g) => (
                  <td key={g.id} className="p-4 text-right tabular-nums">
                    <Link
                      href={href(p.id, g.id)}
                      className="text-primary underline"
                      aria-label={`${p.abbr}: ${p.groups[g.id]} ${g.label}`}
                    >
                      {p.groups[g.id]}
                    </Link>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-5">Nenhum partido corresponde à pesquisa.</p>
        )}
      </div>
    </section>
  );
}
