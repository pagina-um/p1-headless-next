import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payload = await getPayloadInstance();

    // Try to fetch by numeric ID first (wpDatabaseId)
    const result = await payload.find({
      collection: "categories",
      where: {
        wpDatabaseId: {
          equals: parseInt(id),
        },
      },
      limit: 1,
    });

    if (result.docs.length > 0) {
      return NextResponse.json(result.docs[0]);
    }

    // If not found by wpDatabaseId, try by Payload ID
    const categoryById = await payload.findByID({
      collection: "categories",
      id,
    });

    return NextResponse.json(categoryById);
  } catch (error: any) {
    console.error("Failed to fetch category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category", details: error.message },
      { status: 500 }
    );
  }
}
