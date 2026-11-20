import { DESTAQUES } from "@/config/destaques";
import { getProjecto, projectoHref } from "@/projectos/registry";
import { ProjectoIcon } from "@/projectos/icons";

/**
 * Faixa de destaque no topo da página, por baixo do cabeçalho. Promove o
 * projecto escolhido em `src/config/destaques.ts`; a cor e o nome vêm do
 * registo do projecto.
 */
export function PromoBanner() {
  const banner = DESTAQUES.banner;
  if (!banner) return null;
  const projecto = getProjecto(banner.projecto);

  return (
    <div
      className="w-full text-white"
      style={{
        background: `linear-gradient(160deg, ${projecto.color} 0%, ${projecto.colorDark} 100%)`,
      }}
    >
      {/* same container as the navbar so edges line up */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-3.5 flex flex-col md:flex-row md:items-center gap-1.5 md:gap-5 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-2.5 md:gap-3 shrink-0 flex-wrap">
          <span className="text-[13.5px] md:text-[15px] font-semibold leading-snug">
            {banner.lead}
          </span>
          <a
            href={projectoHref(projecto)}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 md:px-3.5 shadow-sm transition hover:bg-white/90 hover:shadow active:translate-y-px"
            style={{ color: projecto.colorDark }}
          >
            <ProjectoIcon
              name={projecto.icon}
              className="w-4 h-4 md:w-[17px] md:h-[17px] shrink-0"
              strokeWidth={2.4}
            />
            <span className="uppercase tracking-[0.22em] text-[13px] md:text-[14px] font-bold leading-none">
              {projecto.title}
            </span>
          </a>
          <span className="text-[13.5px] md:text-[15px] font-normal text-white/90 leading-snug">
            {projecto.kicker}
          </span>
        </div>

        {banner.note && (
          <>
            {/* divider, desktop only */}
            <span
              className="hidden md:block w-px h-5 bg-white/30 shrink-0"
              aria-hidden="true"
            />
            <p className="text-[12px] md:text-[13px] leading-snug text-white/80 hidden md:block">
              {banner.note.before && <>{banner.note.before} </>}
              <a
                href={banner.note.href}
                className="underline underline-offset-2 decoration-white/50 hover:text-white hover:decoration-white transition-colors"
              >
                {banner.note.linkText}
              </a>
              {banner.note.after && <> {banner.note.after}</>}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
