import { NewsGrid } from "@/components/grid/NewsGrid";
import { GridState } from "@/types";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";
import { getPayloadInstance } from "@/services/payload-api";
import { Header } from "@/components/layout/Header";
import { notFound } from "next/navigation";
import { richTextToHtml } from "@/utils/richTextConversion";
import { parserOptions } from "@/utils/wpParsing";
import parse from "html-react-parser";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const page = result.docs[0];

  return {
    title: page?.title || "Página UM",
    description: page?.title || "O jornalismo independente só depende dos leitores.",
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const payload = await getPayloadInstance();

  // Find the page by slug
  const result = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug,
      },
    },
    depth: 2,
    limit: 1,
  });

  const page = result.docs[0];

  // If page not found, show 404
  if (!page) {
    notFound();
  }

  // Render based on page type
  if (page.pageType === "grid-layout") {
    // Grid layout page
    const gridState: GridState | null =
      page.gridLayout && typeof page.gridLayout === "object" && page.gridLayout.gridState
        ? page.gridLayout.gridState
        : null;

    if (!gridState || gridState.blocks.length === 0) {
      return (
        <>
          <Header />
          <main className="max-w-7xl mx-auto pb-8">
            <div className="p-8 text-center text-gray-500">
              <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
              <p>No content configured yet. Please set up the grid layout in the admin panel.</p>
            </div>
          </main>
          <PostFooter />
        </>
      );
    }

    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto pb-8">
          <NewsGrid blocks={gridState.blocks} />
        </main>
        <PostFooter />
      </>
    );
  } else {
    // Article (rich text) page
    // Convert Lexical JSON to HTML
    const htmlContent = page.content ? await richTextToHtml(page.content) : "";

    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <article className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">{page.title}</h1>
            {htmlContent && (
              <div className="prose prose-lg max-w-none font-body-sans text-lg space-y-8
                [&_figcaption]:text-sm [&_figcaption]:italic [&_a]:underline
                [&_a]:text-[var(--color-primary)] [&_p]:mt-0">
                {parse(htmlContent, parserOptions)}
              </div>
            )}
          </article>
        </main>
        <PostFooter />
      </>
    );
  }
}
