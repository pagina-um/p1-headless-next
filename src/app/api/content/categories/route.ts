import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = await getPayloadInstance();

    const result = await payload.find({
      collection: "categories",
      sort: "name",
      limit: 100,
    });

    // TODO: Calculate post count for each category
    // For now, we'll add a postCount field to categories later

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}
