import Link from "next/link";
import { Projeto, projetoHref } from "@/projetos/registry";
import { ProjetoIcon } from "@/projetos/icons";

interface ProjetoCardProps {
  projeto: Projeto;
  /** "block" preenche uma célula da grelha da homepage; "list" é um cartão em /projetos. */
  variant: "block" | "list";
}

export function ProjetoCard({ projeto, variant }: ProjetoCardProps) {
  const href = projetoHref(projeto);

  if (variant === "block") {
    return (
      <article
        className="@container group relative isolate h-full overflow-hidden rounded-md shadow-sm text-white"
        style={{
          background: `linear-gradient(160deg, ${projeto.color} 0%, ${projeto.colorDark} 100%)`,
        }}
      >
        <Link
          href={href}
          aria-label={`Abrir ${projeto.title}`}
          className="absolute inset-0 z-10 transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-white"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 text-white/10"
        >
          <ProjetoIcon
            name={projeto.icon}
            className="h-40 w-40 @md:h-52 @md:w-52"
            strokeWidth={1}
          />
        </div>
        <div className="relative flex h-full flex-col justify-between gap-4 p-5 @md:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">
              Projeto
            </p>
            <h2 className="mt-1 font-serif text-3xl @md:text-4xl @2xl:text-5xl font-bold leading-[1.05]">
              {projeto.title}
            </h2>
            <p className="mt-2 max-w-md text-sm @md:text-base text-white/90">
              {projeto.kicker}
            </p>
            <p className="mt-3 hidden max-w-md text-sm text-white/75 @xl:block">
              {projeto.description}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider transition-transform group-hover:translate-x-0.5">
            Explorar
            <span aria-hidden>→</span>
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex gap-5 rounded-md border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div
        className="absolute inset-y-0 left-0 w-1 rounded-l-md"
        style={{ background: projeto.color }}
        aria-hidden
      />
      <div
        className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
        style={{ background: projeto.color, color: "white" }}
      >
        <ProjetoIcon name={projeto.icon} className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: projeto.colorDark }}
        >
          {projeto.kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-900">
          <Link
            href={href}
            className="after:absolute after:inset-0 hover:text-primary transition-colors"
          >
            {projeto.title}
          </Link>
        </h2>
        <p className="mt-2 text-base text-stone-600">{projeto.description}</p>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-stone-500">
          {projeto.credits ?? "Página UM"}
          {projeto.href && " · Site externo"}
        </p>
      </div>
    </article>
  );
}
