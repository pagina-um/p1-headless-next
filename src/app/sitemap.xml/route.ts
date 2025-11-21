// app/sitemap.xml/route.ts
import { NextResponse } from "next/server";
import { getAllPublishedPosts } from "@/services/payload-api";

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
  const BASE_URL = "https://paginaum.pt";
  const xmlBuilder: string[] = [];

  xmlBuilder.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlBuilder.push(
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">'
  );

  try {
    const { data, error } = await getAllPublishedPosts();

    if (error) {
      console.error("Error fetching sitemap posts: ", error);
      return errorResponse();
    }

    const posts = data?.posts ?? [];

    posts.forEach((post: any) => {
      if (post.date) {
        const date = new Date(post.date);
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const slug = post.slug;
        const categories = post.categories ?? [];
        const keywords = categories
          .map((c: any) => c?.name)
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
              <news:title>${escapeXml(post.title)}</news:title>
              <news:keywords>${keywords}</news:keywords>
            </news:news>
          </url>`
        );
      }
    });
  } catch (error) {
    console.error("Error generating sitemap xml:", error);
    return errorResponse();
  }

  xmlBuilder.push("</urlset>");

  return new NextResponse(xmlBuilder.join(""), {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
