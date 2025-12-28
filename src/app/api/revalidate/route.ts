import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

interface TaxonomyTerm {
  term_id: number;
  name: string;
  slug: string;
  taxonomy: string;
}

interface WPWebhooksPayload {
  post_id: number;
  post: {
    ID: number;
    post_author: string;
    post_name: string;
    post_status: string;
    post_type: string;
  };
  post_permalink: string;
  taxonomies?: {
    category?: Record<string, TaxonomyTerm>;
    post_tag?: Record<string, TaxonomyTerm>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Support both header and query parameter authentication
    const authHeader = request.headers.get("authorization");
    const secretParam = request.nextUrl.searchParams.get("secret");

    const isValidHeader = authHeader === `Bearer ${REVALIDATION_SECRET}`;
    const isValidParam = secretParam === REVALIDATION_SECRET;

    if (!REVALIDATION_SECRET || (!isValidHeader && !isValidParam)) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body: WPWebhooksPayload = await request.json();
    const { post, post_permalink, taxonomies } = body;

    // Only revalidate published posts
    if (post?.post_status !== "publish") {
      return NextResponse.json({
        revalidated: false,
        message: "Post is not published, skipping revalidation",
      });
    }

    // Extract path from full permalink URL
    let postUri: string;
    try {
      const url = new URL(post_permalink);
      postUri = url.pathname;
    } catch {
      return NextResponse.json(
        { message: "Invalid post_permalink URL" },
        { status: 400 }
      );
    }

    const revalidatedPaths: string[] = [];

    // Revalidate the post page
    revalidatePath(postUri);
    revalidatedPaths.push(postUri);

    // Revalidate homepage
    revalidatePath("/");
    revalidatedPaths.push("/");

    // Revalidate category pages
    if (taxonomies?.category) {
      for (const categorySlug of Object.keys(taxonomies.category)) {
        const path = `/cat/${categorySlug}`;
        revalidatePath(path);
        revalidatedPaths.push(path);
      }
    }

    // Revalidate tag pages
    if (taxonomies?.post_tag) {
      for (const tagSlug of Object.keys(taxonomies.post_tag)) {
        const path = `/tag/${tagSlug}`;
        revalidatePath(path);
        revalidatedPaths.push(path);
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      timestamp: Date.now(),
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: String(err) },
      { status: 500 }
    );
  }
}
