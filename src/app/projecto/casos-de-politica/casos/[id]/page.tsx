import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { BASE, NAV, SLUG } from "../../_lib/archive";
import { aliases, recordById, records } from "../../_lib/data";
import { RecordDetails } from "../../_components/RecordDetails";
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    ...records.map((r) => ({ id: r.id })),
    ...Object.keys(aliases).map((id) => ({ id })),
  ];
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const record = recordById((await params).id);
  return {
    title: `${record?.title || "Ficha não encontrada"} | Casos de Política | Página UM`,
    description: record?.summary,
    alternates: {
      canonical: record ? `${BASE}/casos/${record.id}` : `${BASE}/casos`,
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (aliases[id]) permanentRedirect(`${BASE}/casos/${aliases[id]}`);
  const r = recordById(id);
  if (!r) notFound();
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <p className="mb-6 text-sm">
        <Link href={`${BASE}/casos`} className="text-primary underline">
          Consultar todos os casos
        </Link>
      </p>
      <RecordDetails record={r} />
      {r.related.length > 0 && (
        <section className="mt-10 max-w-3xl">
          <h3>Outros processos relacionados</h3>
          <ul>
            {r.related
              .map(recordById)
              .filter((x) => !!x)
              .map((x) => (
                <li key={x.id}>
                  <Link
                    href={`${BASE}/casos/${x.id}`}
                    className="text-primary underline"
                  >
                    {x.title}
                  </Link>
                  <span className="block text-sm text-stone-500">
                    {x.status}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </ProjectoShell>
  );
}
