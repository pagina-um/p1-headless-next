import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { getProjecto, projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, SLUG, readFilters } from "../_lib/archive";
import { index, parties } from "../_lib/data";
import { CaseList } from "../_components/CaseList.client";
import { ContextNote } from "../_components/Common";

export const metadata = {
  ...projectoMetadata(SLUG),
  title: "Casos e decisões | Casos de Política | Página UM",
  alternates: { canonical: `${BASE}/casos` },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams))
    if (typeof value === "string") params.set(key, value);
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <div className="max-w-3xl">
        <h2>Casos e decisões</h2>
        <p>
          Todos os casos e documentos numa única listagem, incluindo as decisões
          sobre contas partidárias. Filtre pela natureza, fase ou desfecho
          documentado.
        </p>
        <ContextNote />
      </div>
      <CaseList
        key={params.toString()}
        records={index}
        parties={parties.map(({ id, name, abbr }) => ({ id, name, abbr }))}
        initial={readFilters(params)}
        color={getProjecto(SLUG).colorDark}
      />
    </ProjectoShell>
  );
}
