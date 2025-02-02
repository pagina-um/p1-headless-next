import { revalidatePath, revalidateTag } from "next/cache";
import { loadGridState, saveGridState } from "@/services/jsonbin";

export async function POST(request: Request) {
  const gridState = await request.json();
  if (!gridState) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
  await saveGridState(gridState);
  revalidateTag("homepage-grid"); // Revalidate all fetches with this tag
  revalidatePath("/");
  return Response.json({ revalidated: true });
}

export async function GET() {
  const gridState = await loadGridState();
  return Response.json(gridState);
}
