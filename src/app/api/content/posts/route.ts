import {
  getPostsByCategoryId,
  getLatestPosts,
} from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const categoryId = searchParams.get("category");
    const excludeIds = searchParams.get("exclude");

    // Parse exclude IDs
    const excludePostIds = excludeIds
      ? excludeIds.split(",").filter(Boolean)
      : [];

    // If category is specified, use category-specific endpoint
    if (categoryId) {
      const { data, error } = await getPostsByCategoryId(
        parseInt(categoryId),
        limit,
        excludePostIds
      );

      if (error || !data) {
        return NextResponse.json(
          { error: error || "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        docs: data.posts.nodes,
        totalDocs: data.posts.nodes.length,
      });
    }

    // Otherwise, get latest posts
    const { data, error } = await getLatestPosts(limit);

    if (error || !data) {
      return NextResponse.json(
        { error: error || "Failed to fetch posts" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      docs: data.posts.nodes,
      totalDocs: data.posts.nodes.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}
