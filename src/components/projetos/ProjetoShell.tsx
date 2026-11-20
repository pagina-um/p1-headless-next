import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";
import { getProjeto } from "@/projetos/registry";
import { ProjetoIcon } from "@/projetos/icons";
import { ProjetoNav, ProjetoNavItem } from "./ProjetoNav.client";

interface ProjetoShellProps {
  /** slug em src/projetos/registry.ts */
  slug: string;
  /** Secções do projeto, quando tem mais do que uma página. */
  nav?: ProjetoNavItem[];
  children: React.ReactNode;
}

/**
 * Moldura comum a todas as páginas de um projeto especial: cabeçalho do site,
 * cabeçalho do projeto (nome, lema, descrição, créditos), navegação entre
 * secções, área de conteúdo e rodapé. As páginas em
 * `src/app/projetos/<slug>/` só têm de fornecer o conteúdo.
 */
export function ProjetoShell({ slug, nav, children }: ProjetoShellProps) {
  const projeto = getProjeto(slug);
  const published = new Date(projeto.publishedAt).toLocaleDateString("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Header section="Projetos" />
      <div
        className="bg-white border-b border-gray-200"
        style={{ borderTop: `4px solid ${projeto.color}` }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <p
            className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: projeto.colorDark }}
          >
            <ProjetoIcon name={projeto.icon} className="w-4 h-4" />
            {projeto.kicker}
          </p>
          <h1 className="mt-3 max-w-4xl font-serif text-4xl md:text-6xl font-bold leading-[1.05] text-stone-900">
            {projeto.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl leading-relaxed text-stone-600">
            {projeto.description}
          </p>
          <p className="mt-5 text-[11px] uppercase tracking-wider text-stone-500">
            {projeto.credits ?? "Página UM"} · {published}
          </p>
        </div>
        {nav && nav.length > 0 && (
          <ProjetoNav items={nav} color={projeto.colorDark} />
        )}
      </div>
      <main className="projeto-content max-w-7xl mx-auto px-4 py-8 md:py-12">
        {children}
      </main>
      <PostFooter />
    </>
  );
}
