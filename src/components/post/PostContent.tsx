interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none font-body-sans text-lg space-y-8"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
