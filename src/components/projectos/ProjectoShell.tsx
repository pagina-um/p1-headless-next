import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";
import { getProjecto } from "@/projectos/registry";
import { ProjectoIcon } from "@/projectos/icons";
import { ProjectoNav, ProjectoNavItem } from "./ProjectoNav.client";

interface ProjectoShellProps {
  /** slug em src/projectos/registry.ts */
  slug: string;
  /** Secções do projecto, quando tem mais do que uma página. */
  nav?: ProjectoNavItem[];
  children: React.ReactNode;
}

/**
 * Moldura comum a todas as páginas de um projecto especial: cabeçalho do site,
 * cabeçalho do projecto (nome, lema, descrição, créditos), navegação entre
 * secções, área de conteúdo e rodapé. As páginas em
 * `src/app/projectos/<slug>/` só têm de fornecer o conteúdo.
 */
export function ProjectoShell({ slug, nav, children }: ProjectoShellProps) {
  const projecto = getProjecto(slug);
  const published = new Date(projecto.publishedAt).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Header section="Projectos" />
      <div
        className="bg-white border-b border-gray-200"
        style={{ borderTop: `4px solid ${projecto.color}` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <p
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: projecto.colorDark }}
          >
            <ProjectoIcon name={projecto.icon} className="w-4 h-4" />
            {projecto.kicker}
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl md:text-6xl font-bold leading-[1.05] text-stone-900">
            {projecto.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl leading-relaxed text-stone-600">
            {projecto.description}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-wider text-stone-500">
            {projecto.credits ?? "Página UM"} · {published}
          </p>
        </div>
        {nav && nav.length > 0 && (
          <ProjectoNav items={nav} color={projecto.colorDark} />
        )}
      </div>
      <main className="projecto-content max-w-7xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <PostFooter />
    </>
  );
}
