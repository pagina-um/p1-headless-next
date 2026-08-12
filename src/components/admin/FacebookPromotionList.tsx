"use client";

import { useState } from "react";
import { ImageOff, Send } from "lucide-react";
import { FacebookPromotionDialog } from "./FacebookPromotionDialog";
import type { PromoPost } from "./XPromotionList";

const dateFormatter = new Intl.DateTimeFormat("pt-PT", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function FacebookPromotionList({
  posts,
  adminToken,
}: {
  posts: PromoPost[];
  adminToken: string;
}) {
  const [selected, setSelected] = useState<PromoPost | null>(null);
  const [promoted, setPromoted] = useState<Record<number, string>>({});

  if (posts.length === 0) {
    return (
      <p className="bg-white shadow-lg p-6 text-gray-600">
        Não há peças publicadas para apresentar.
      </p>
    );
  }

  return (
    <>
      <ul className="bg-white shadow-lg divide-y divide-gray-100">
        {posts.map((post) => {
          const thumb = post.featuredImage?.node?.sourceUrl;
          const postUrl = promoted[post.databaseId];
          return (
            <li
              key={post.databaseId}
              className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="w-24 h-16 flex-shrink-0 bg-gray-100 flex items-center justify-center overflow-hidden">
                {thumb ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={thumb}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageOff className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  className="font-medium leading-snug line-clamp-2"
                  dangerouslySetInnerHTML={{ __html: post.title ?? "" }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {post.date ? dateFormatter.format(new Date(post.date)) : ""}
                  {post.categories?.nodes?.[0]?.name
                    ? ` · ${post.categories.nodes[0].name}`
                    : ""}
                  {post.author?.node?.name ? ` · ${post.author.node.name}` : ""}
                </p>
              </div>

              {postUrl ? (
                <a
                  href={postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-green-700 underline flex-shrink-0"
                >
                  Publicado no Facebook
                </a>
              ) : (
                <button
                  onClick={() => setSelected(post)}
                  className="flex-shrink-0 bg-gray-900 text-white text-sm px-3 py-2 flex items-center gap-2 hover:bg-gray-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Promover no Facebook
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {selected && (
        <FacebookPromotionDialog
          post={selected}
          adminToken={adminToken}
          onClose={() => setSelected(null)}
          onPublished={(url) =>
            setPromoted((current) => ({ ...current, [selected.databaseId]: url }))
          }
        />
      )}
    </>
  );
}
