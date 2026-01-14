import { parserOptions } from "@/utils/wpParsing";
import { injectDonationBlock } from "@/utils/contentInjection";
import parse from "html-react-parser";

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

  // Inject donation block into the content
  const contentWithDonation = !shouldInjectDonation
    ? contentWithoutManualFooter
    : injectDonationBlock(contentWithoutManualFooter);

  return (
    <>
      <article
        className="prose prose-lg max-w-none font-body-sans text-lg space-y-8
        [&_figcaption]:text-sm [&_figcaption]:italic [&_a]:underline
        [&_a]:text-[var(--color-primary)] [&_hr]:last-of-type:hidden [&_p]:mt-0"
      >
        {parse(contentWithDonation, parserOptions)}
      </article>
    </>
  );
}
