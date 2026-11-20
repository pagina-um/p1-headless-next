import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";
import { ProjectoCard } from "@/components/projectos/ProjectoCard";
import { PROJECTOS } from "@/projectos/registry";

export const metadata: Metadata = {
  title: "Projectos | Página UM",
  description:
    "Arquivos, observatórios e bases de dados do Página UM, abertos ao escrutínio dos leitores.",
};

export default function ProjectosPage() {
  const projectos = PROJECTOS.slice().sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt)
  );

  return (
    <>
      <Header section="Projectos" />
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <header className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-dark">
            Página UM
          </p>
          <h1 className="mt-3 font-serif text-4xl md:text-6xl font-bold leading-[1.05] text-stone-900">
            Projectos
          </h1>
          <p className="mt-4 text-lg md:text-xl leading-relaxed text-stone-600">
            Arquivos, observatórios e bases de dados que o jornalismo do Página
            UM foi construindo. Todos com fontes, método e dados abertos.
          </p>
        </header>
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {projectos.map((projecto) => (
            <ProjectoCard key={projecto.slug} projecto={projecto} variant="list" />
          ))}
        </div>
      </main>
      <PostFooter />
    </>
  );
}
