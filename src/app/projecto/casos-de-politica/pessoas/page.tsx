import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, SLUG } from "../_lib/archive";
import { people } from "../_lib/data";
import { PeopleDirectory } from "../_components/Directories.client";
import { Downloads } from "../_components/Common";
export const metadata = {
  ...projectoMetadata(SLUG),
  title: "Pessoas | Casos de Política | Página UM",
  alternates: { canonical: `${BASE}/pessoas` },
};
export default function Page() {
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <div className="max-w-3xl">
        <h2>Pessoas no registo</h2>
        <p>
          Cargos, percursos e papéis documentados em cada processo. O índice
          pode incluir testemunhas e outros intervenientes e não é uma lista de
          pessoas condenadas.
        </p>
        <Downloads query="entidade=pessoas" />
      </div>
      <PeopleDirectory people={people} />
    </ProjectoShell>
  );
}
