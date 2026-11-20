import Link from "next/link";
import { Projecto, projectoHref } from "@/projectos/registry";
import { ProjectoIcon } from "@/projectos/icons";

interface ProjectoCardProps {
  projecto: Projecto;
  /** "block" preenche uma célula da grelha da homepage; "list" é um cartão em /projectos. */
  variant: "block" | "list";
}

export function ProjectoCard({ projecto, variant }: ProjectoCardProps) {
  const href = projectoHref(projecto);

  if (variant === "block") {
    return (
      <article
        className="@container group relative isolate h-full overflow-hidden rounded-md shadow-sm text-white"
        style={{
          background: `linear-gradient(160deg, ${projecto.color} 0%, ${projecto.colorDark} 100%)`,
        }}
      >
        <Link
          href={href}
          aria-label={`Abrir ${projecto.title}`}
          className="absolute inset-0 z-10 transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-white"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 text-white/10"
        >
          <ProjectoIcon
            name={projecto.icon}
            className="h-40 w-40 @md:h-52 @md:w-52"
            strokeWidth={1}
          />
        </div>
        <div className="relative flex h-full flex-col justify-between gap-4 p-5 @md:p-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/80">
              Projecto
            </p>
            <h2 className="mt-1 font-serif text-3xl @md:text-4xl @2xl:text-5xl font-bold leading-[1.05]">
              {projecto.title}
            </h2>
            <p className="mt-2 max-w-md text-sm @md:text-base text-white/90">
              {projecto.kicker}
            </p>
            <p className="mt-3 hidden max-w-md text-sm text-white/75 @xl:block">
              {projecto.description}
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
        style={{ background: projecto.color }}
        aria-hidden
      />
      <div
        className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
        style={{ background: projecto.color, color: "white" }}
      >
        <ProjectoIcon name={projecto.icon} className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: projecto.colorDark }}
        >
          {projecto.kicker}
        </p>
        <h2 className="mt-1 font-serif text-2xl font-bold leading-tight text-stone-900">
          <Link
            href={href}
            className="after:absolute after:inset-0 hover:text-primary transition-colors"
          >
            {projecto.title}
          </Link>
        </h2>
        <p className="mt-2 text-base text-stone-600">{projecto.description}</p>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-stone-500">
          {projecto.credits ?? "Página UM"}
          {projecto.href && " · Site externo"}
        </p>
      </div>
    </article>
  );
}
