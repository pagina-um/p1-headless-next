import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayloadInstance();

    const result = await payload.findByID({
      collection: "posts",
      id,
      depth: 2,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to fetch post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post", details: error.message },
      { status: 500 }
    );
  }
}
