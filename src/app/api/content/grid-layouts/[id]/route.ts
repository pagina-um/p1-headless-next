import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";

// GET /api/content/grid-layouts/[id] - Get a specific grid layout by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayloadInstance();

    const layout = await payload.findByID({
      collection: "grid-layouts",
      id,
    });

    if (!layout) {
      return NextResponse.json(
        { error: "Grid layout not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(layout);
  } catch (error: any) {
    console.error("Failed to fetch grid layout:", error);
    return NextResponse.json(
      { error: "Failed to fetch grid layout", details: error.message },
      { status: 500 }
    );
  }
}
