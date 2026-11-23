import Image from "next/image";
import Link from "next/link";
import { StaticBlock } from "@/types";
import { historiaPath, historiasRecentes } from "@/historias/registry";
import { formatDate } from "@/utils/categoryUtils";

/**
 * Homepage block listing the latest stories written in the repository
 * (src/historias). Stories from WordPress are placed on the grid one by one
 * in /admin; these have no WordPress id, so this block lists them itself.
 */
export function HistoriasBlockServer({ block }: { block: StaticBlock }) {
  const historias = historiasRecentes(4);
  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

  return (
    <section
      className="@container h-full overflow-hidden rounded-md border border-gray-200 bg-white p-4 shadow-sm block-content"
      style={gridStyles}
      aria-label="Histórias"
    >
      <ul className="divide-y divide-gray-200">
        {historias.length === 0 && (
          <li className="py-3 text-sm italic text-stone-500">
            Sem histórias publicadas.
          </li>
        )}
        {historias.map((h) => (
          <li key={h.slug} className="py-3 first:pt-0 last:pb-0">
            <Link href={historiaPath(h)} className="group flex gap-3">
              {h.cover && (
                <span className="relative hidden @sm:block h-16 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
                  <Image
                    src={h.cover.src}
                    alt={h.cover.alt}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </span>
              )}
              <span className="min-w-0">
                <span className="block text-[10px] font-semibold uppercase tracking-wider text-primary-dark">
                  {h.antetitulo}
                </span>
                <span className="mt-0.5 block font-serif text-lg font-bold leading-snug text-stone-900 group-hover:text-primary">
                  {h.title}
                </span>
                <time
                  dateTime={h.publishedAt}
                  className="mt-1 block text-[11px] uppercase tracking-wider text-stone-500"
                >
                  {formatDate(h.publishedAt)}
                </time>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
