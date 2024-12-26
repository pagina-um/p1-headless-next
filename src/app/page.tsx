import { loadGridState } from "@/services/jsonbin";
import { NewsGrid } from "@/components/news/NewsGrid";
import { GridState } from "@/types";

async function getInitialState(): Promise<GridState | null> {
  try {
    return await loadGridState();
  } catch (error) {
    console.error("Failed to load initial grid state:", error);
    return null;
  }
}

export default async function HomePage() {
  const initialState = await getInitialState();

  if (!initialState) {
    return (
      <main className="max-w-7xl mx-auto pb-8">
        <div className="p-8 text-center text-gray-500">
          <p>Failed to load content. Please try again later.</p>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-7xl mx-auto pb-8">
      <NewsGrid blocks={[]} />
    </main>
  );
}
