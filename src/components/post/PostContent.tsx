import { parserOptions } from "@/utils/wpParsing";
import { injectDonationBlock } from "@/utils/contentInjection";
import parse from "html-react-parser";

/** Typography of an article body. Shared with stories written in the repo. */
export const ARTICLE_BODY_CLASS =
  "article-content prose prose-lg max-w-none font-body-sans text-lg space-y-8 [&_figcaption]:text-sm [&_figcaption]:italic [&_a]:underline [&_a]:text-[var(--color-primary)] [&_hr]:last-of-type:hidden [&_p]:mt-0";

interface PostContentProps {
  content: string;
  shouldInjectDonation?: boolean;
}

export function PostContent({
  content,
  shouldInjectDonation,
}: PostContentProps) {
  const contentWithoutManualFooter = content.split(
    `<p><strong>PÁGINA UM &#8211; <em>O jornalismo independente (só) depende dos leitores.</em></strong></p>`
  )[0]; // TODO: bring this transformation to the parsing function

  // Remove the first wp-block-spacer (decorative spacer at top of WP content)
  const contentWithoutFirstSpacer = contentWithoutManualFooter.replace(
    /<div[^>]*\bwp-block-spacer\b[^>]*><\/div>/,
    ""
  );

  // Inject donation block into the content
  const contentWithDonation = !shouldInjectDonation
    ? contentWithoutFirstSpacer
    : injectDonationBlock(contentWithoutFirstSpacer);

  return (
    <>
      <article className={ARTICLE_BODY_CLASS}>
        {parse(contentWithDonation, parserOptions)}
      </article>
    </>
  );
}
