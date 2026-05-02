import Link from "next/link";
import { StaticBlock, StoryBlock } from "@/types";
import { isDevelopment } from "@/services/config";
import { loadGridStateLocal } from "@/services/local-storage";
import { loadGridStateRedis } from "@/services/redis";
import { getClient, GET_POST_BY_ID } from "@/services/wp-graphql";
import { formatDate } from "@/utils/categoryUtils";

interface CulturaBannerProps {
  block: StaticBlock;
}

interface ResolvedStory {
  uId: string;
  uri: string;
  title: string;
  date: string;
}

async function getCulturaGridState() {
  try {
    if (isDevelopment) {
      return await loadGridStateLocal("grid-state-cultura.json");
    }
    return await loadGridStateRedis("grid-state-cultura", "cultura-grid");
  } catch {
    return null;
  }
}

async function resolveStory(
  block: StoryBlock
): Promise<ResolvedStory | null> {
  const { data } = await getClient().query(GET_POST_BY_ID, {
    id: block.databaseId.toString(),
  });
  const post = data?.post;
  if (!post) return null;
  return {
    uId: block.uId,
    uri: post.uri ?? "#",
    title: block.title || post.title || "",
    date: post.date || "",
  };
}

export async function CulturaBannerServer({ block }: CulturaBannerProps) {
  const gridState = await getCulturaGridState();
  const storyBlocks = (gridState?.blocks ?? []).filter(
    (b): b is StoryBlock => b.blockType === "story"
  );
  const latest = storyBlocks
    .slice()
    .sort((a, b) => b.uId.localeCompare(a.uId))
    .slice(0, 5);

  const resolved = (await Promise.all(latest.map(resolveStory))).filter(
    (s): s is ResolvedStory => s !== null
  );

  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

  return (
    <article
      className="group relative isolate h-full overflow-hidden rounded-md border border-amber-200/60 bg-gradient-to-br from-[#f5ecd9] via-[#f0e4c7] to-[#e8d9b0] shadow-sm block-content"
      style={gridStyles}
    >
      <Link
        href="/cultura"
        aria-label="Ver secção Cultura"
        className="absolute inset-0 z-10 transition-colors hover:bg-black/[0.02] focus-visible:outline-2 focus-visible:outline-amber-700"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -left-6 -top-10 text-[11rem] leading-none font-serif italic text-amber-900/5 select-none"
      >
        C
      </div>

      <div className="relative flex h-full flex-col gap-4 p-5 md:flex-row md:gap-6 md:p-6">
        <header className="flex shrink-0 flex-col justify-between md:w-2/5">
          <div>
            <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-amber-800/80">
              Secção
            </p>
            <h2 className="font-instrument mt-1 text-5xl font-normal leading-[0.9] tracking-tight text-stone-900 md:text-6xl lg:text-7xl">
              Cultura
            </h2>
            <p className="mt-3 max-w-xs text-sm text-stone-700/90">
              Livros, arte, ideias e ensaio no Página UM.
            </p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-amber-900 transition-transform group-hover:translate-x-0.5">
            Ver tudo
            <span aria-hidden>→</span>
          </span>
        </header>

        <div className="flex flex-1 flex-col">
          <p className="mb-2 font-serif text-[10px] uppercase tracking-[0.35em] text-amber-800/80">
            Recentes
          </p>
          <ul className="flex-1 divide-y divide-amber-900/10">
            {resolved.length === 0 && (
              <li className="py-3 text-sm italic text-stone-600">
                Sem histórias na grelha de Cultura.
              </li>
            )}
            {resolved.map((story) => (
              <li
                key={story.uId}
                className="relative z-20 py-2.5 first:pt-0"
              >
                <Link
                  href={story.uri}
                  className="block focus-visible:outline-2 focus-visible:outline-amber-700"
                >
                  <h3 className="font-serif text-base leading-snug text-stone-900 hover:text-amber-900 md:text-[17px]">
                    {story.title}
                  </h3>
                  {story.date && (
                    <time
                      dateTime={story.date}
                      className="mt-0.5 block text-[11px] uppercase tracking-wider text-stone-500"
                    >
                      {formatDate(story.date)}
                    </time>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}
