import { getPayloadInstance } from "@/services/payload-api";
import { NextResponse } from "next/server";
import { GridState } from "@/types";

// GET /api/grid-layouts - Get active layout or all layouts
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get("active") === "true";

    const payload = await getPayloadInstance();

    if (activeOnly) {
      // Get only the active layout
      const result = await payload.find({
        collection: "grid-layouts",
        where: {
          isActive: {
            equals: true,
          },
        },
        limit: 1,
      });

      const activeLayout = result.docs[0];

      if (!activeLayout) {
        // Return default empty grid state
        return NextResponse.json({
          gridState: {
            blocks: [],
            createdAt: new Date().toISOString(),
          },
        });
      }

      return NextResponse.json(activeLayout);
    }

    // Get all layouts
    const result = await payload.find({
      collection: "grid-layouts",
      sort: "-updatedAt",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Failed to fetch grid layouts:", error);
    return NextResponse.json(
      { error: "Failed to fetch grid layouts", details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/grid-layouts - Create or update grid layout
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { gridState, name } = body as {
      gridState: GridState;
      name?: string;
    };

    if (!gridState) {
      return NextResponse.json(
        { error: "gridState is required" },
        { status: 400 }
      );
    }

    const payload = await getPayloadInstance();

    // Check if there's an existing active layout
    const existingLayouts = await payload.find({
      collection: "grid-layouts",
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    });

    const existingLayout = existingLayouts.docs[0];

    if (existingLayout) {
      // Update existing layout
      const updated = await payload.update({
        collection: "grid-layouts",
        id: existingLayout.id,
        data: {
          gridState,
          name: name || existingLayout.name,
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        layout: updated,
        message: "Grid layout updated successfully",
      });
    }

    // Create new layout
    const created = await payload.create({
      collection: "grid-layouts",
      data: {
        name: name || "Homepage Grid",
        gridState,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      layout: created,
      message: "Grid layout created successfully",
    });
  } catch (error: any) {
    console.error("Failed to save grid layout:", error);
    return NextResponse.json(
      { error: "Failed to save grid layout", details: error.message },
      { status: 500 }
    );
  }
}
