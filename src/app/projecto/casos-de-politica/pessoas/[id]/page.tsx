import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { BASE, NAV, SLUG, formatDate } from "../../_lib/archive";
import { people, personById, records } from "../../_lib/data";
import { Portrait, ContextNote } from "../../_components/Common";
import { EntityDetails, ProceduralNote } from "../../_components/RecordDetails";
export const dynamicParams = false;
export function generateStaticParams() {
  return people.map((p) => ({ id: p.id }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = personById((await params).id);
  return {
    title: `${p?.name || "Pessoa não encontrada"} | Casos de Política | Página UM`,
    description:
      "Papéis documentados, fontes e processos associados. A inclusão não equivale a imputação de culpa.",
    alternates: {
      canonical: p ? `${BASE}/pessoas/${p.id}` : `${BASE}/pessoas`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const p = personById((await params).id);
  if (!p) notFound();
  const associated = records
    .filter((r) => p.recordIds.includes(r.id))
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <p className="mb-6 text-sm">
        <Link href={`${BASE}/pessoas`} className="text-primary underline">
          Consultar o índice de pessoas
        </Link>
      </p>
      <div className="flex flex-col items-start gap-6 sm:flex-row">
        <Portrait person={p} />
        <div className="min-w-0 max-w-3xl">
          <h2>{p.name}</h2>
          <p>
            {p.recordIds.length}{" "}
            {p.recordIds.length === 1 ? "ficha associada" : "fichas associadas"}
            . Os cargos, as ligações políticas e o papel desta pessoa são os
            documentados em cada processo.
          </p>
          <ContextNote />
        </div>
      </div>
      <section className="mt-10">
        <h2>Processos e papéis documentados</h2>
        <p className="max-w-3xl">
          O desfecho de um processo pode ser diferente para cada interveniente.
          Consulte o papel individual e o histórico da ficha.
        </p>
        <div className="mt-5 space-y-5">
          {associated.map((r) => {
            const participant = r.people.find((x) => x.id === p.id)!;
            return (
              <article
                key={r.id}
                className="rounded-md border border-gray-200 bg-white p-5"
              >
                <p className="text-sm text-stone-500">
                  {formatDate(r.dateLabel)} · {r.nature}
                </p>
                <h3>
                  <Link
                    href={`${BASE}/casos/${r.id}`}
                    className="text-primary hover:underline"
                  >
                    {r.title}
                  </Link>
                </h3>
                <p>
                  <strong>Papel de {p.name}:</strong> {participant.role}
                </p>
                <ProceduralNote person={participant} />
                <p className="text-sm text-stone-600">
                  Resultado da ficha: {r.status}
                </p>
                <p className="max-w-3xl">{r.affiliation}</p>
                {r.entityCases
                  .filter((e) => e.people.includes(p.name))
                  .map((e, i) => (
                    <EntityDetails key={i} entity={e} person={p.name} />
                  ))}
                <Link
                  href={`${BASE}/casos/${r.id}`}
                  className="mt-4 inline-block text-sm text-primary underline"
                >
                  Consultar a ficha, histórico e fontes
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </ProjectoShell>
  );
}
