import { NewsGrid } from "@/components/grid/NewsGrid";
import { GridState } from "@/types";
import { PostFooter } from "@/components/post/PostFooter";
import { Metadata } from "next";
import { getPayloadInstance } from "@/services/payload-api";
import { Header } from "@/components/layout/Header";
import { richTextToHtml } from "@/utils/richTextConversion";
import { parserOptions } from "@/utils/wpParsing";
import parse from "html-react-parser";

export const metadata: Metadata = {
  title: "Página UM",
  description: "O jornalismo independente só depende dos leitores.",
};

export default async function HomePage() {
  const payload = await getPayloadInstance();

  // First, try to find a page marked as homepage
  const pageResult = await payload.find({
    collection: "pages",
    where: {
      isHomePage: {
        equals: true,
      },
    },
    depth: 2,
    limit: 1,
  });

  const page = pageResult.docs[0];

  // If no homepage page is configured, check for an active grid layout
  if (!page) {
    const layoutResult = await payload.find({
      collection: "grid-layouts",
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    });

    const activeLayout = layoutResult.docs[0];

    if (activeLayout?.gridState) {
      const gridState = activeLayout.gridState as GridState;

      if (gridState.blocks.length > 0) {
        return (
          <>
            <Header />
            <main className="max-w-7xl mx-auto pb-8">
              <NewsGrid blocks={gridState.blocks} />
            </main>
            <PostFooter />
          </>
        );
      }
    }

    // No homepage or active layout configured
    return (
      <>
        <Header />
        <main className="max-w-7xl mx-auto pb-8">
          <div className="p-8 text-center text-gray-500">
            <p>No homepage configured yet. Please set a page as homepage or mark a grid layout as active in the admin panel.</p>
          </div>
        </main>
        <PostFooter />
      </>
    );
  }

  // Render based on page type (same logic as /pages/[slug])
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
