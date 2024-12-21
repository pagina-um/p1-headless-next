import React from "react";
import { Story } from "../../types";
import { User, Calendar } from "lucide-react";
import Link from "next/link";
import { getPostById, getPostBySlug } from "@/services/wordpress";
import { WPPost, WPPostById } from "@/types/wordpress";
import { notFound } from "next/navigation";

interface NewsStoryProps {
  id: string;
}
async function getPostData(id: string): Promise<WPPostById | null> {
  try {
    return await getPostById(id);
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function NewsStory({ id }: NewsStoryProps) {
  const story = await getPostData(id);
  const relativeLink = new URL(story?.link || "https://www.paginaum.pt")
    .pathname;

  if (!story) {
    return "Conteúdo não encontrado.";
  }
  const image = story._links["wp:featuredmedia"];
  console.log(image);
  return (
    <Link href={relativeLink}>
      <div className="relative h-full overflow-hidden  shadow-lg group">
        <img
          src={"https://p1-git.local/wp-content/uploads/2024/09/1_01.jpg"}
          alt={"story.title"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="absolute bottom-0 p-6 text-white">
            <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 leading-tight">
              {story.title.rendered}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {story.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(story.date).toLocaleDateString("pt-PT")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

/*   */
