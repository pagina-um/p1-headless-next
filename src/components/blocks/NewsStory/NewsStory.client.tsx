"use client";

import { GET_POST_BY_ID } from "@/services/wp-graphql";
import { StoryBlock } from "@/types";
import { useQuery } from "@urql/next";
import { NewsStoryCommon } from "./NewsStoryCommon";
import { useHistorias } from "@/components/admin/HistoriasContext";
import { historiaToStoryPost } from "@/historias/meta";

interface NewsStoryProps {
  story: StoryBlock;
}

export function NewsStoryClient({ story }: NewsStoryProps) {
  const { databaseId, historiaSlug } = story;
  const historias = useHistorias();

  // A story from the repository has no WordPress post to fetch.
  const [{ data, error }] = useQuery({
    query: GET_POST_BY_ID,
    variables: { id: databaseId.toString() },
    pause: !!historiaSlug,
  });

  if (historiaSlug) {
    const historia = historias.find((h) => h.slug === historiaSlug);
    return (
      <NewsStoryCommon
        story={story}
        data={historia ? { post: historiaToStoryPost(historia) } : undefined}
        error={undefined}
        isAdmin={true}
      />
    );
  }

  return (
    <NewsStoryCommon story={story} data={data} error={error} isAdmin={true} />
  );
}
