import { PostFooter } from "@/components/post/PostFooter";
import {
  getClient,
  GET_ALL_PAGES,
  GET_PAGE_BY_SLUG,
} from "@/services/wp-graphql";
import { parserOptions } from "@/utils/wpParsing";
import parse from "html-react-parser";

import { notFound } from "next/navigation";

export async function generateStaticParams() {
  const { data, error } = await getClient().query(GET_ALL_PAGES, {});

  if (error || !data?.pages) {
    console.log("Error fetching posts:", error);
    return [];
  }

  return data.pages.nodes.map((node) => {
    if (!node.uri) {
      return null;
    }
    return {
      params: {
        yearOrSlug: node.uri,
      },
    };
  });
}

export default async function StaticPage({
  params,
}: {
  params: { yearOrSlug: string };
}) {
  const { yearOrSlug } = params;
  const { data, error } = await getClient().query(GET_PAGE_BY_SLUG, {
    slug: yearOrSlug,
  });

  if (error || !data?.pageBy?.content) {
    notFound();
  }

  return (
    <>
      <article className="wp-content">
        <h1>{data.pageBy.title}</h1>
        {parse(data.pageBy.content, parserOptions)}
      </article>
    </>
  );
}
