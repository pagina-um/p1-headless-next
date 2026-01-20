import { getPayload } from "payload";
import config from "@payload-config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "./carousel";
import { CategoryBlockProps } from "../blocks/CategoryBlock.server";
import { CategoryBlockHeader } from "../blocks/CategoryBlockHeader";
import { PayloadPost, PayloadCategory, getPostImageUrl, getPostImageAlt } from "@/types";
import Image from "next/image";
import { titleCaseExceptForSomeWords, decodeHtmlEntities } from "@/utils/utils";
import { twMerge } from "tailwind-merge";
import { GRID_COLUMNS } from "@/constants/blocks";

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
  excludePostIds = [],
}: CategoryCarouselProps) {
  const effectiveCategoryId = block.categoryId || block.wpCategoryId;

  if (!effectiveCategoryId) {
    return (
      <div className="text-red-500 p-4">
        Error: Invalid category configuration
      </div>
    );
  }

  const payload = await getPayload({ config });

  // Fetch category
  let category: PayloadCategory | null = null;
  try {
    const categoryDoc = await payload.findByID({
      collection: "categories",
      id: String(effectiveCategoryId),
    });
    category = categoryDoc as PayloadCategory;
  } catch {
    const result = await payload.find({
      collection: "categories",
      where: {
        wpDatabaseId: { equals: Number(effectiveCategoryId) },
      },
      limit: 1,
    });
    category = (result.docs[0] as PayloadCategory) || null;
  }

  if (!category) {
    return (
      <div className="text-red-500 p-4">
        Error: Category not found
      </div>
    );
  }

  // Fetch posts for this category
  const postsResult = await payload.find({
    collection: "posts",
    where: {
      categories: { in: [category.id] },
      _status: { equals: "published" },
      ...(excludePostIds.length > 0 && {
        id: { not_in: excludePostIds },
      }),
    },
    limit: totalPosts,
    sort: "-publishedAt",
    depth: 2,
  });

  const posts = postsResult.docs as PayloadPost[];

  return (
    <div className={`relative ${className}`}>
      <CategoryBlockHeader
        title={block.wpCategoryName || category.name}
        link={`/cat/${category.slug}`}
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
            const imageUrl = getPostImageUrl(post);
            const imageAlt = getPostImageAlt(post);

            return (
              <CarouselItem
                key={post.id}
                className={`pl-2 md:pl-4 basis-1/2 md:basis-1/${cardsPerView}`}
              >
                <div
                  style={{
                    height: `${block.gridPosition.height * 60 - 40}px`,
                  }}
                  className={twMerge(
                    "relative overflow-hidden rounded-lg group"
                  )}
                >
                  {imageUrl && (
                    <Image
                      src={imageUrl}
                      alt={imageAlt || ""}
                      fill
                      sizes={`(max-width: 768px) 50vw, ${100 / cardsPerView}vw`}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      priority={index < 2}
                    />
                  )}
                  {post.antetitulo && post.antetitulo.length > 0 && (
                    <div className="absolute top-2 pt-0 left-3 text-white">
                      <h3 className="font-sans text-sm mb-2 line-clamp-5 leading-[0.01rem] inline font-extrabold tracking-tighter bg-primary-dark">
                        &nbsp;&nbsp; {titleCaseExceptForSomeWords(post.antetitulo)}{" "}
                        &nbsp;&nbsp;
                      </h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <div className="absolute bottom-0 p-4 pt-0 text-white">
                      <h3 className="font-serif text-lg mb-2 line-clamp-5 leading-5">
                        {decodeHtmlEntities(post.title)}
                      </h3>
                    </div>
                  </div>
                  <a href={post.uri || "#"} className="absolute inset-0" />
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        {block.gridPosition.width === GRID_COLUMNS && (
          <>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
}
