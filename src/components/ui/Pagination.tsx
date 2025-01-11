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
  return (
    <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-8 pt-6">
      <div className="flex w-0 flex-1">
        {currentPage > 1 && (
          <Link
            href={`${basePath}${
              currentPage > 2
                ? `?page=${currentPage - 1}&after=${startCursor}`
                : ""
            }`}
            className="inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Link>
        )}
      </div>
      <div className="hidden md:flex">
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{currentPage}</span>
        </span>
      </div>
      <div className="flex w-0 flex-1 justify-end">
        {hasNextPage && (
          <Link
            href={`${basePath}?page=${currentPage + 1}&after=${endCursor}`}
            className="inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
