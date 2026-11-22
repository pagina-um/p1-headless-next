import Image from "next/image";
import { Calendar } from "lucide-react";
import { Historia, historiaPath } from "@/historias/registry";
import { ARTICLE_BODY_CLASS } from "@/components/post/PostContent";
import SocialShare from "@/components/post/SocialShare";
import { formatDate } from "@/utils/categoryUtils";

/**
 * A story written in the repository, rendered like a WordPress one: same
 * container, header, body typography and share links as PostComponent in
 * the article route. Keep the two in step.
 */
export async function HistoriaArticle({ historia }: { historia: Historia }) {
  const { default: Corpo } = await historia.load();
  const url = "https://paginaum.pt" + historiaPath(historia);

  return (
    <article>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-12">
        <header className="mb-4 md:mb-8">
          <h2 className="flex font-sans bg-primary-dark w-fit pr-2 items-start text-pretty text-white font-semibold text-xs p-2 gap-x-1 before:content-[''] before:block before:w-1 before:h-full before:bg-white before:flex-shrink-0 mb-2">
            {historia.antetitulo}
          </h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-3 md:mb-8">
            {historia.title}
          </h1>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>{historia.author}</span>
              <span className="text-gray-300">|</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(historia.publishedAt)}
              </span>
            </div>
            <SocialShare
              url={url}
              description=""
              title={historia.title}
              className="items-start md:items-end"
            />
          </div>
        </header>

        {historia.cover && (
          <figure className="mb-8">
            <Image
              src={historia.cover.src}
              alt={historia.cover.alt}
              width={1200}
              height={675}
              sizes="(max-width: 896px) 100vw, 896px"
              priority
              className="w-full h-auto rounded-lg"
            />
            {historia.cover.credit && (
              <figcaption className="mt-2 text-sm italic text-stone-500">
                {historia.cover.credit}
              </figcaption>
            )}
          </figure>
        )}

        <div className={ARTICLE_BODY_CLASS}>
          <Corpo />
        </div>

        <div className="mt-8 flex justify-center flex-col mx-auto text-center items-center gap-y-2">
          Partilhe esta notícia nas redes sociais.
          <SocialShare url={url} description="" title={historia.title} />
        </div>
      </div>
    </article>
  );
}
