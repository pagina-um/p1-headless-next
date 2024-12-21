import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(request: Request) {
  revalidateTag("homepage-grid"); // Revalidate all fetches with this tag
  return Response.json({ revalidated: true });
}
