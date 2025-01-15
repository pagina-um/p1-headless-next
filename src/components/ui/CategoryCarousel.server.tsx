import {
  GET_POSTS_BY_CATEGORY,
  GET_POSTS_BY_CATEGORY_SLUG,
  getClient,
} from "@/services/wp-graphql";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";
import { CategoryBlockProps } from "../blocks/CategoryBlock.server";
import { CategoryBlockHeader } from "../blocks/CategoryBlockHeader";

export interface CategoryCarouselProps extends CategoryBlockProps {
  cardsPerView?: number;
  className?: string;
  totalPosts?: number;
}

export async function CategoryCarouselServer({
  block,
  cardsPerView = 3,
  className = "",
  totalPosts = 12,
}: CategoryCarouselProps) {
  const { data, error } = await getClient().query(GET_POSTS_BY_CATEGORY, {
    categoryId: block.wpCategoryId,
    postsPerPage: totalPosts,
  });
  const posts = data?.posts?.nodes || [];
  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <CategoryBlockHeader title={block.wpCategoryName} />
      <Carousel
        opts={{
          align: "start",
          loop: false,
          skipSnaps: false,
          slidesToScroll: cardsPerView,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {posts.map((post) => (
            <CarouselItem
              key={post.id}
              className={`pl-2 md:pl-4 basis-full md:basis-1/${cardsPerView}`}
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg group">
                {post.featuredImage?.node?.sourceUrl && (
                  <img
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || ""}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                  <div className="absolute bottom-0 p-4 text-white">
                    <h3 className="font-serif text-lg font-bold mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                  </div>
                </div>
                <a href={post.uri!} className="absolute inset-0" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
