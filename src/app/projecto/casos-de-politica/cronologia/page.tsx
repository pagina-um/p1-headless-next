import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { getProjecto, projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, SLUG, readFilters } from "../_lib/archive";
import { index, parties } from "../_lib/data";
import { CaseList } from "../_components/CaseList.client";

export const metadata = {
  ...projectoMetadata(SLUG),
  title: "Cronologia | Casos de Política | Página UM",
  alternates: { canonical: `${BASE}/cronologia` },
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
        <h2>Cronologia</h2>
        <p>
          O marco de referência de cada ficha, da decisão ou notícia mais
          recente para a mais antiga. As datas conhecidas apenas pelo ano ou mês
          conservam essa precisão. O histórico completo encontra-se dentro de
          cada caso.
        </p>
      </div>
      <CaseList
        key={params.toString()}
        records={index.filter((r) => r.dateLabel)}
        parties={parties.map(({ id, name, abbr }) => ({ id, name, abbr }))}
        initial={readFilters(params)}
        color={getProjecto(SLUG).colorDark}
        chronology
      />
    </ProjectoShell>
  );
}
