"use client";
import React, { useEffect, useState } from "react";
import { useCategoryPosts } from "@/hooks/useCategoryPosts";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader } from "lucide-react";
import { CategoryBlockHeader } from "../blocks/CategoryBlockHeader";
import { CategoryCarouselProps } from "./CategoryCarousel.server";
import { CustomPostFields } from "@/types";
import Image from "next/image";
import { titleCaseExceptForSomeWords } from "@/utils/utils";
import { twMerge } from "tailwind-merge";
import { GRID_COLUMNS } from "@/constants/blocks";

export function CategoryCarouselClient({
  block,
  cardsPerView = 3,
  className = "",
  totalPosts = 12,
  excludePostIds = [],
}: CategoryCarouselProps) {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [after, setAfter] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { data, fetching, error } = useCategoryPosts(
    block.categoryId || block.wpCategoryId,
    totalPosts,
    excludePostIds
  );

  useEffect(() => {
    if (data?.posts?.nodes) {
      setAllPosts(data.posts.nodes);
    }
  }, [data]);

  const loadMorePosts = async () => {
    if (!after || isLoadingMore) return;

    setIsLoadingMore(true);
    const categorySlug = "opiniao"; // TODO: make the "load more" work
    const result = await fetch(
      `/api/posts?category=${categorySlug}&after=${after}&first=${totalPosts}`
    );
    const newData = await result.json();

    if (newData?.posts?.nodes) {
      setAllPosts((prev) => [...prev, ...newData.posts.nodes]);
      setAfter(newData.posts.pageInfo.endCursor);
    }

    setIsLoadingMore(false);
  };

  if (fetching && !isLoadingMore) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading posts
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
          align: "center",
          loop: true,
          skipSnaps: false,
          slidesToScroll: 1,
          breakpoints: {
            "(max-width: 768px)": { align: "center" },
          },
        }}
        className="w-full"
        onSelect={(api) => {
          const lastVisibleIndex =
            (api as any).selectedScrollSnap() * cardsPerView + cardsPerView;
          if (
            lastVisibleIndex >= allPosts.length - cardsPerView &&
            data?.posts?.pageInfo?.hasNextPage
          ) {
            return; //  loadMorePosts(); TODO: make this work in the future
          }
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {allPosts.map((post, index) => {
            const postFields = (post?.postFields || {}) as CustomPostFields;
            const antetitulo = postFields?.antetitulo || "";
            return (
              <CarouselItem
                key={post.id}
                className={`pl-2 md:pl-4 basis-1/2 md:basis-1/${cardsPerView}`}
              >
                <div
                  style={
                    {
                      height: `${block.gridPosition.height * 60 - 40}px`,
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
                      className="object-cover group-hover:scale-105 transition-transform duration-300 h-full"
                      priority={index < 2}
                    />
                  )}
                  {antetitulo && antetitulo?.length > 0 && (
                    <div className="absolute top-2 pt-0 left-3 text-white">
                      <h3 className="font-sans text-sm mb-2 line-clamp-5 leading-[0.01rem] inline font-extrabold tracking-tighter bg-primary-dark">
                        &nbsp;&nbsp; {titleCaseExceptForSomeWords(antetitulo)}{" "}
                        &nbsp;&nbsp;
                      </h3>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
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
          {isLoadingMore && (
            <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3">
              <div className="flex items-center justify-center h-full">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            </CarouselItem>
          )}
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
