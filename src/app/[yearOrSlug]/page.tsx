import { PostFooter } from "@/components/post/PostFooter";
import {
  getClient,
  GET_ALL_PAGES,
  GET_PAGE_BY_SLUG,
} from "@/services/wp-graphql";
import { parserOptions } from "@/utils/wpParsing";
import parse from "html-react-parser";

import { notFound } from "next/navigation";

// Only the WordPress pages returned by generateStaticParams exist at this
// level. Anything else (bot probes for /wp-login.php, /.env, random slugs)
// used to render through this page: a function invocation, a GraphQL query
// against WordPress and an ISR write of a 404, per probe. With
// dynamicParams off, unknown slugs 404 at the edge without touching anything.
// Adding a page in WordPress therefore needs a redeploy to go live.
export const dynamicParams = false;
// Page edits in WordPress show up within a day; the webhook only covers posts.
export const revalidate = 86400;

export async function generateStaticParams() {
  const { data, error } = await getClient().query(GET_ALL_PAGES, {});

  // Fail the build rather than silently prerendering nothing. Swallowing this
  // turned a backend blip into "no pages were generated", which looks identical
  // to a successful build.
  if (error) {
    throw new Error(
      `Failed to load pages for static generation: ${error.message}`,
      { cause: error }
    );
  }

  // uri comes back as "/contactos/"; this segment matches a single bare slug.
  // The root ("/") and nested pages cannot be served here and are skipped.
  return (data?.pages?.nodes ?? []).flatMap((node) => {
    const slug = (node.uri ?? "").replace(/^\/+|\/+$/g, "");
    return slug && !slug.includes("/") ? [{ yearOrSlug: slug }] : [];
  });
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ yearOrSlug: string }>;
}) {
  const { yearOrSlug } = await params;
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
