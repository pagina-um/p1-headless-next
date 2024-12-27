interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none font-body-sans text-lg space-y-8 [&_figcaption]:text-sm [&_figcaption]:italic [&_a]:underline [&_a]:text-[var(--color-primary)] "
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
