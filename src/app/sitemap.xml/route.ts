// app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';
import {
  getClient,
  GET_LATEST_POSTS_FOR_STATIC_GENERATION,
} from "@/services/wp-graphql";

export async function GET() {
  const BASE_URL = "https://www.paginaum.pt";
  const xmlBuilder: string[] = [];
  let hasNextPage = true;
  let after = null;
  
  xmlBuilder.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlBuilder.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">')

  // Fetch all posts using pagination
  while (hasNextPage) {

    const { data }: any = await getClient().query(
      GET_LATEST_POSTS_FOR_STATIC_GENERATION,
      { first: 100, after }, // Fetch 100 posts at a time
      { requestPolicy: "network-only" }
    );

    const edges = data?.posts?.edges ?? [];
    const pageInfo = data?.posts?.pageInfo;

    edges.forEach((e: any) => {
      if (e.node.date) {
        const date = new Date(e.node.date);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const slug = e.node.slug;

        xmlBuilder.push(`
          <url>
            <loc>${BASE_URL}/${year}/${month}/${day}/${slug}</loc>
            <news:news>
              <news:publication>
                <news:name>Página Um</news:name>
                <news:language>pt</news:language>
              </news:publication>
              <news:publication_date>${new Date(e.node.date).toISOString()}</news:publication_date>
              <news:title>${escapeXml(e.node.title)}</news:title>
              <news:keywords>${e.node.categories.edges.map((c: any) => c.node.name).join(',')}</news:keywords>
            </news:news>
          </url>
          `)
      }
    })

    // Update pagination variables
    hasNextPage = pageInfo?.hasNextPage ?? false;
    after = pageInfo?.endCursor ?? null;
  }

  xmlBuilder.push('</urlset>')

  return new NextResponse(xmlBuilder.join(''), {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}