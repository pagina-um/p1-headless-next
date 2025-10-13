import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  basePath: string;
  startCursor?: string | null;
  endCursor?: string | null;
}

export default function Pagination({
  currentPage,
  hasNextPage,
  basePath,
  startCursor,
  endCursor,
}: PaginationProps) {
  // Helper to build hrefs by merging/updating query params reliably
  const buildHref = (
    updates: Record<string, string | number | null | undefined>
  ) => {
    const [path, queryString] = basePath.split("?");
    const params = new URLSearchParams(queryString || "");

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });

    const qs = params.toString();
    return qs ? `${path}?${qs}` : path;
  };

  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-8 pt-6">
      <div className="flex w-0 flex-1">
        {currentPage > 1 && (
          <Link
            href={
              currentPage === 2
                ? buildHref({ page: null, after: null })
                : buildHref({
                    page: currentPage - 1,
                    after: startCursor || null,
                  })
            }
            prefetch={false}
            rel="prev"
            className="inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Link>
        )}
      </div>
      <div className="hidden md:flex">
        <span className="text-sm text-gray-700">
          Página <span className="font-medium">{currentPage}</span>
        </span>
      </div>
      <div className="flex w-0 flex-1 justify-end">
        {hasNextPage && (
          <Link
            href={buildHref({
              page: currentPage + 1,
              after: endCursor || undefined,
            })}
            prefetch={false}
            rel="next"
            className="inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Próximo
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
