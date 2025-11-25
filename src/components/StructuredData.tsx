import Script from "next/script";

interface StructuredDataProps {
  data:
    | Record<string, any>
    | Record<string, any>[];
}

/**
 * Component to render JSON-LD structured data in the page head
 * Supports single schema or array of schemas
 */
export function StructuredData({ data }: StructuredDataProps) {
  const schemas = Array.isArray(data) ? data : [data];

  return (
    <>
      {schemas.map((schema, index) => (
        <Script
          key={index}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
