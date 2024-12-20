interface PostContentProps {
  content: string;
}

export function PostContent({ content }: PostContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none font-body-serif"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
