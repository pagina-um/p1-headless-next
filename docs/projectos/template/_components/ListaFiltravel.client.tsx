"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

/**
 * Lista pesquisável e filtrável. Corre no browser ("use client") porque
 * reage ao que o leitor escreve; tudo o resto no projecto deve ser
 * componentes de servidor (sem "use client").
 */
export interface Registo {
  id: string;
  titulo: string;
  categoria: string;
  ano: number;
  estado: string;
  resumo: string;
  fonte?: { label: string; href: string };
}

export function ListaFiltravel({ registos }: { registos: Registo[] }) {
  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState("");

  const categorias = useMemo(
    () => Array.from(new Set(registos.map((r) => r.categoria))).sort(),
    [registos]
  );

  const visiveis = useMemo(() => {
    const t = termo.trim().toLocaleLowerCase("pt-PT");
    return registos
      .filter((r) => !categoria || r.categoria === categoria)
      .filter(
        (r) =>
          !t ||
          r.titulo.toLocaleLowerCase("pt-PT").includes(t) ||
          r.resumo.toLocaleLowerCase("pt-PT").includes(t)
      )
      .sort((a, b) => b.ano - a.ano);
  }, [registos, termo, categoria]);

  return (
    <section aria-labelledby="lista-titulo">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <h2 id="lista-titulo" className="font-serif text-2xl font-bold">
          Registos
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <span className="sr-only">Pesquisar</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
              aria-hidden
            />
            <input
              type="search"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Pesquisar"
              className="w-full rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none sm:w-64"
            />
          </label>
          <label>
            <span className="sr-only">Categoria</span>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="">Todas as categorias</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-500" aria-live="polite">
        {visiveis.length} de {registos.length} registos
      </p>

      <ul className="mt-4 divide-y divide-gray-200 border-y border-gray-200">
        {visiveis.map((r) => (
          <li key={r.id} className="grid gap-2 py-4 md:grid-cols-[6rem_1fr_10rem]">
            <span className="text-sm font-semibold tabular-nums text-stone-500">
              {r.ano}
            </span>
            <div>
              <h3 className="font-serif text-lg font-semibold leading-snug text-stone-900">
                {r.titulo}
              </h3>
              <p className="mt-1 text-sm text-stone-600">{r.resumo}</p>
              {r.fonte && (
                <a
                  href={r.fonte.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-xs uppercase tracking-wider text-primary underline underline-offset-2"
                >
                  {r.fonte.label}
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
              <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-stone-600">
                {r.categoria}
              </span>
              <span className="text-[11px] uppercase tracking-wider text-stone-500">
                {r.estado}
              </span>
            </div>
          </li>
        ))}
        {visiveis.length === 0 && (
          <li className="py-8 text-center text-sm italic text-stone-500">
            Nenhum registo corresponde à pesquisa.
          </li>
        )}
      </ul>
    </section>
  );
}
