import React from "react";
import { WPPostsList } from "./WPPostsList";
import { useQuery } from "@urql/next";
import { GET_LATEST_POSTS } from "@/services/wp-graphql";
import type { HistoriaMeta } from "@/historias/meta";
import { Plus } from "lucide-react";

interface StoriesListProps {
  onSelectPost: (databaseId: number, postId: string) => void;
  historias?: HistoriaMeta[];
  onSelectHistoria?: (slug: string) => void;
}

export function StoriesList({
  onSelectPost,
  historias = [],
  onSelectHistoria,
}: StoriesListProps) {
  const [result] = useQuery({
    query: GET_LATEST_POSTS,
    requestPolicy: "network-only",
  });
  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Blocos individuais</h2>
      <div className="max-h-[400px] overflow-y-auto pr-2 -mr-2">
        {historias.length > 0 && (
          <div className="mb-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Histórias do repositório
            </h3>
            {historias.map((h) => (
              <div
                key={h.slug}
                className="p-3 border border-primary-lighter bg-primary-lightest/40 hover:bg-primary-lightest transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-wider text-primary-dark">
                      {h.antetitulo} · {h.publishedAt}
                    </p>
                    <h3 className="font-medium text-sm line-clamp-2">{h.title}</h3>
                  </div>
                  <button
                    onClick={() => onSelectHistoria?.(h.slug)}
                    className="text-xs px-2 py-1 bg-white rounded-full flex items-center gap-1 flex-shrink-0 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
            <h3 className="pt-2 text-xs font-semibold uppercase tracking-wider text-stone-500">
              WordPress
            </h3>
          </div>
        )}
        <WPPostsList
          posts={(result.data?.posts as any) || []}
          onSelectPost={onSelectPost}
        />
      </div>
    </div>
  );
}
