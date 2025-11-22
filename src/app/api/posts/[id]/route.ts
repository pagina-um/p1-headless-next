import { getPostById } from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await getPostById(id);

    if (error || !data) {
      return NextResponse.json(
        { error: error || "Post not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data.post);
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post", details: error.message },
      { status: 500 }
    );
  }
}
