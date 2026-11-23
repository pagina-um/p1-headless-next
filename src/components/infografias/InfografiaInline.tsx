import dynamic from "next/dynamic";
import { getInfografia } from "@/infografias/registry";

/**
 * Renders a registered infografia in the flow of an article, where the
 * WordPress content carried `<div data-infografia="<slug>"></div>`.
 * An unknown slug renders a quiet note rather than breaking the article.
 */
export function InfografiaInline({ slug }: { slug: string }) {
  const infografia = getInfografia(slug);
  if (!infografia) {
    return (
      <p className="my-6 border-l-4 border-gray-300 pl-4 text-sm italic text-stone-500">
        Infografia «{slug}» indisponível.
      </p>
    );
  }
  const Infografia = dynamic(infografia.load);
  return (
    <figure
      className="not-prose my-8 -mx-4 md:mx-0"
      aria-label={infografia.title}
      data-infografia={slug}
    >
      <Infografia />
    </figure>
  );
}
