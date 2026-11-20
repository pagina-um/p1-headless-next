import Link from "next/link";
import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { getProjecto, projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, SLUG, formatDate } from "./_lib/archive";
import { manifest, rows } from "./_lib/data";
import { ContextNote, Downloads } from "./_components/Common";
import { Summary } from "./_components/Summary.client";

export const metadata = {
  ...projectoMetadata(SLUG),
  alternates: { canonical: BASE },
};
export default function Page() {
  const project = getProjecto(SLUG);
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <section className="max-w-3xl">
        <h2>Síntese dos casos</h2>
        <p>
          Autarcas, governantes e gestores públicos com ligação política
          documentada. Um arquivo comum, com as fontes, os recursos e os
          desfechos de cada processo.
        </p>
        <ContextNote />
        <p className="text-sm text-stone-500">
          Fontes consultadas até {formatDate(manifest.checkedAt)}.
        </p>
      </section>
      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Casos únicos catalogados",
            value: manifest.cases,
            href: `${BASE}/casos?c=Casos`,
          },
          {
            label: "Pessoas no registo",
            value: manifest.people,
            href: `${BASE}/pessoas`,
          },
          {
            label: "Partidos actuais no directório",
            value: manifest.currentParties,
            href: `${BASE}/partidos`,
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-md border border-gray-200 bg-white p-5 shadow-sm"
          >
            <dt className="text-[11px] uppercase tracking-wider text-stone-500">
              {item.label}
            </dt>
            <dd
              className="mt-2 font-serif text-4xl font-bold"
              style={{ color: project.colorDark }}
            >
              <Link href={item.href} className="hover:underline">
                {item.value}
              </Link>
            </dd>
          </div>
        ))}
      </dl>
      <Summary rows={rows} />
      <section className="mt-10 max-w-3xl">
        <h2>Memória, acompanhamento e contraditório</h2>
        <p>
          As condenações, absolvições, arquivamentos e perdas de mandato
          aparecem no mesmo arquivo. A ficha de cada pessoa permite acompanhar
          processos distintos sem confundir o seu papel ou o resultado de cada
          um.
        </p>
        <p>
          O directório inclui ainda {manifest.historicalParties} partidos
          históricos. A falta de casos catalogados não prova a inexistência de
          processos.
        </p>
        <div className="flex flex-wrap gap-5">
          <Link
            className="text-primary underline underline-offset-4"
            href={`${BASE}/metodo`}
          >
            Consultar o método e a ficha técnica
          </Link>
          <Downloads />
        </div>
      </section>
    </ProjectoShell>
  );
}
