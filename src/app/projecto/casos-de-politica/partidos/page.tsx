import Link from "next/link";
import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { projectoMetadata } from "@/projectos/registry";
import { BASE, NAV, SLUG, formatDate } from "../_lib/archive";
import { manifest, parties, rows } from "../_lib/data";
import { PartyDirectory } from "../_components/Directories.client";
import { Downloads } from "../_components/Common";
export const metadata = {
  ...projectoMetadata(SLUG),
  title: "Partidos | Casos de Política | Página UM",
  alternates: { canonical: `${BASE}/partidos` },
};
export default function Page() {
  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      <div className="max-w-3xl">
        <h2>Partidos</h2>
        <p>
          Partidos constantes da lista do Tribunal Constitucional consultada em{" "}
          {formatDate(manifest.checkedAt)}, acompanhados dos partidos históricos
          referidos nas fichas. Seleccione um partido para explorar os casos
          disponíveis.
        </p>
        <p>
          <Link href={BASE} className="text-primary underline">
            Consultar a síntese com todos os desfechos
          </Link>
        </p>
        <Downloads query="entidade=partidos" />
      </div>
      <PartyDirectory
        parties={parties}
        counts={Object.fromEntries(rows.map((p) => [p.id, p.total]))}
      />
    </ProjectoShell>
  );
}
