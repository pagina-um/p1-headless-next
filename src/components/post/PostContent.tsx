import { parserOptions } from "@/utils/wpParsing";
import parse from "html-react-parser";
interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  const contentWithoutManualFooter = content.split(
    `<p><strong>PÁGINA UM &#8211; <em>O jornalismo independente (só) depende dos leitores.</em></strong></p>`
  )[0]; // TODO: bring this transformation to the parsing function

  return (
    <>
      <article
        className="prose prose-lg max-w-none font-body-sans text-lg space-y-8
        [&_figcaption]:text-sm [&_figcaption]:italic [&_a]:underline
        [&_a]:text-[var(--color-primary)] [&_hr]:last-of-type:hidden [&&_p]:first-of-type:mt-0"
      >
        {parse(contentWithoutManualFooter, parserOptions)}
      </article>
    </>
  );
}
