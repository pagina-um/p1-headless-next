// app/api/revalidate/route.ts
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

// You should replace this with a secure token/secret
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

export async function POST(request: NextRequest) {
  try {
    // Verify the request contains the correct secret token
    const authHeader = request.headers.get("authorization");
    if (
      !REVALIDATION_SECRET ||
      !authHeader ||
      `Bearer ${REVALIDATION_SECRET}` !== authHeader
    ) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { post_id, post_type, post_slug } = body;

    if (!post_id || !post_type || !post_slug) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Revalidate the specific post page using the full permalink
    revalidatePath(`/${post_slug}`);

    // Revalidate any archive pages that might list this post
    revalidatePath("/");

    return NextResponse.json({
      revalidated: true,
      message: `Revalidated ${post_type}: ${post_slug}`,
      now: Date.now(),
    });
  } catch (err) {
    console.error("Revalidation error:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: err },
      { status: 500 }
    );
  }
}
