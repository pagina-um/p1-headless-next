import { ProjectoShell } from "@/components/projectos/ProjectoShell";
import { projectoMetadata } from "@/projectos/registry";
import { ListaFiltravel, Registo } from "./_components/ListaFiltravel.client";
import registos from "./data/registos.json";

// Substitua "exemplo" pelo slug do projecto, igual ao da pasta e ao do registo.
const SLUG = "exemplo";

export const metadata = projectoMetadata(SLUG);

// Secções do projecto. Cada uma é uma pasta com page.tsx dentro desta.
// Apague se o projecto tiver uma única página.
const NAV = [
  { label: "Síntese", href: `/projectos/${SLUG}` },
  { label: "Método", href: `/projectos/${SLUG}/metodo` },
];

const dados = registos as Registo[];

export default function Page() {
  const concluidos = dados.filter((r) => r.estado === "Concluído").length;

  return (
    <ProjectoShell slug={SLUG} nav={NAV}>
      {/* Números-chave: três a quatro, nunca mais. */}
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          ["Registos", dados.length],
          ["Concluídos", concluidos],
          ["Categorias", new Set(dados.map((r) => r.categoria)).size],
          ["Desde", Math.min(...dados.map((r) => r.ano))],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-md border border-gray-200 bg-white p-4"
          >
            <dt className="text-[11px] uppercase tracking-wider text-stone-500">
              {label}
            </dt>
            <dd className="mt-1 font-serif text-3xl font-bold text-stone-900">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {/* Texto corrido: usa as classes do .projecto-content (h2, p, listas). */}
      <section className="mt-10 max-w-3xl">
        <h2>Sobre este arquivo</h2>
        <p>
          Dois ou três parágrafos a explicar o que se catalogou, com que
          critério e o que os números não dizem. Uma acusação não é prova de
          culpa; uma contagem não é uma medida comparável.
        </p>
      </section>

      <div className="mt-10">
        <ListaFiltravel registos={dados} />
      </div>
    </ProjectoShell>
  );
}
