// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import {
  getClient,
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
} from "@/services/wp-graphql";
import { OperationResult } from "@urql/next";

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function errorResponse() {
  return new NextResponse("Internal Server Error", {
    status: 500,
    headers: { "Content-Type": "text/plain" },
  });
}

export async function GET() {
  const BASE_URL = "https://www.paginaum.pt";
  const xmlBuilder: string[] = [];
  let hasNextPage = true;
  let after = null;

  xmlBuilder.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlBuilder.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
  );

  while (hasNextPage) {
    try {
      const result: OperationResult<any> = await getClient()
        .query(
          GET_LATEST_POSTS_FOR_STATIC_GENERATION,
          { first: 100, after },
          { requestPolicy: "network-only" }
        )
        .toPromise();

      if (result.error) {
        console.error("Error fetching sitemap posts: ", result.error.message);
        return errorResponse();
      }

      const edges = result.data?.posts?.edges ?? [];
      const pageInfo = result.data?.posts?.pageInfo;

      edges.forEach((e: any) => {
        if (e.node.date) {
          const date = new Date(e.node.date);
          const year = date.getFullYear().toString();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const slug = e.node.slug;
          const categoryEdges = e.node.categories?.edges ?? [];
          const keywords = categoryEdges
            .map((c: any) => c?.node?.name)
            .filter(Boolean)
            .map(escapeXml)
            .join(",");

          xmlBuilder.push(
            `<url>
              <loc>${BASE_URL}/${year}/${month}/${day}/${slug}</loc>
              <news:news>
                <news:publication>
                  <news:name>Página Um</news:name>
                  <news:language>pt</news:language>
                </news:publication>
                <news:publication_date>${date.toISOString()}</news:publication_date>
                <news:title>${escapeXml(e.node.title)}</news:title>
                <news:keywords>${keywords}</news:keywords>
              </news:news>
            </url>`
          );
        }
      });

      hasNextPage = pageInfo?.hasNextPage ?? false;
      after = pageInfo?.endCursor ?? null;
    } catch (error) {
      console.error("Error generating sitemap xml:", error);
      return errorResponse();
    }
  }

  xmlBuilder.push("</urlset>");

  return new NextResponse(xmlBuilder.join(""), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
