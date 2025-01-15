"use client";
import React, { useEffect, useState } from "react";
import { useQuery } from "urql";
import { GET_POSTS_BY_CATEGORY_SLUG } from "@/services/wp-graphql";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Loader } from "lucide-react";
import { CategoryBlockHeader } from "../blocks/CategoryBlockHeader";

interface CategoryCarouselProps {
  categorySlug: string;
  postsPerPage?: number;
  cardsPerView?: number;
  className?: string;
}

export function CategoryCarouselClient({
  categorySlug,
  postsPerPage = 6,
  cardsPerView = 3,
  className = "",
}: CategoryCarouselProps) {
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [after, setAfter] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [{ data, fetching, error }] = useQuery({
    query: GET_POSTS_BY_CATEGORY_SLUG,
    variables: {
      slug: categorySlug,
      postsPerPage,
      after: null,
    },
  });

  useEffect(() => {
    if (data?.posts?.nodes) {
      setAllPosts(data.posts.nodes);
      setAfter(data.posts.pageInfo.endCursor);
    }
  }, [data]);

  const loadMorePosts = async () => {
    if (!after || isLoadingMore) return;

    setIsLoadingMore(true);

    const result = await fetch(
      `/api/posts?category=${categorySlug}&after=${after}&first=${postsPerPage}`
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
        Error loading posts: {error.message}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <CategoryBlockHeader title="Opinião" />
      <Carousel
        opts={{
          align: "start",
          loop: false,
          skipSnaps: false,
          slidesToScroll: cardsPerView,
        }}
        className="w-full"
        onSelect={(api) => {
          const lastVisibleIndex =
            (api as any).selectedScrollSnap() * cardsPerView + cardsPerView;
          if (
            lastVisibleIndex >= allPosts.length - cardsPerView &&
            data?.posts?.pageInfo?.hasNextPage
          ) {
            loadMorePosts();
          }
        }}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {allPosts.map((post) => (
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
                    {post.postFields?.chamadaDestaque && (
                      <p className="text-sm text-gray-200 line-clamp-2">
                        {post.postFields.chamadaDestaque}
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={post.uri}
                  className="absolute inset-0"
                  aria-label={post.title}
                />
              </div>
            </CarouselItem>
          ))}
          {isLoadingMore && (
            <CarouselItem className="pl-2 md:pl-4 basis-full md:basis-1/3">
              <div className="flex items-center justify-center h-full">
                <Loader className="w-6 h-6 animate-spin text-primary" />
              </div>
            </CarouselItem>
          )}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </div>
  );
}
