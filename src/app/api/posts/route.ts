import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "publish";

    const payload = await getPayloadInstance();

    const result = await payload.find({
      collection: "posts",
      limit,
      sort: "-publishedAt",
      where: {
        status: {
          equals: status,
        },
      },
      depth: 1,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts", details: error.message },
      { status: 500 }
    );
  }
}
