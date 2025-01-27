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
import { CustomPostFields } from "@/types";
import Image from "next/image";
import { titleCaseExceptForSomeWords } from "@/utils/utils";
import { twMerge } from "tailwind-merge";

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
    sameCategoryIdAsString: block.wpCategoryId.toString(),
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
  const category = data?.category;
  return (
    <div className={`relative ${className}`}>
      <CategoryBlockHeader
        title={block.wpCategoryName}
        link={`/cat/${category?.slug}`}
      />
      <Carousel
        opts={{
          align: "start",
          loop: true,
          skipSnaps: false,
          slidesToScroll: 1,
          breakpoints: {
            "(max-width: 768px)": { align: "center" },
          },
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {posts.map((post, index) => {
            const { antetitulo }: CustomPostFields = post.postFields as any;
            return (
              <CarouselItem
                key={post.id}
                className={`pl-2 md:pl-4 basis-1/2 md:basis-1/${cardsPerView}`}
              >
                {" "}
                <div
                  style={
                    {
                      minHeight: `${block.gridPosition.height * 48}px`,
                      aspectRatio: "4/5",
                    } as React.CSSProperties
                  }
                  className={twMerge(
                    "relative overflow-hidden rounded-lg group"
                  )}
                >
                  {post.featuredImage?.node?.sourceUrl && (
                    <Image
                      src={post.featuredImage.node.sourceUrl}
                      alt={post.featuredImage.node.altText || ""}
                      fill
                      sizes={`(max-width: 768px) 50vw, ${100 / cardsPerView}vw`}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={index < 2}
                    />
                  )}
                  <div className="absolute top-3 pt-0 left-4 text-white">
                    <h3 className="font-sans text-xl  mb-2 line-clamp-5 leading-[0.01rem]  inline  font-extrabold tracking-tighter  bg-primary-dark ">
                      {titleCaseExceptForSomeWords(antetitulo)}
                    </h3>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
                    <div className="absolute bottom-0 p-4 pt-0 text-white">
                      <h3 className="font-serif text-lg  mb-2 line-clamp-5 leading-5 ">
                        {post.title}
                      </h3>
                    </div>
                  </div>
                  <a href={post.uri!} className="absolute inset-0" />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}

const getHeightClass = (height: number) => {
  console.log(height);
  // Map height values to Tailwind classes
  const heightMap: Record<number, string> = {
    1: "min-h-[48px]",
    2: "min-h-[96px]",
    3: "min-h-[144px]",
    4: "min-h-[192px]",
    5: "min-h-[240px]",
    6: "min-h-[288px]",
    7: "min-h-[336px]",
    8: "min-h-[384px]",
    9: "min-h-[432px]",
    10: "min-h-[480px]",

    // Add more mappings as needed
  };
  return heightMap[height] || "min-h-48"; // Default fallback
};
