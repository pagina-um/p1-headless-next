// filepath: /Users/zemaria/Downloads/project3/src/components/layout/SearchButton.tsx
"use client";
import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
      setSearchQuery("");
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div className="relative">
      {isExpanded ? (
        <form
          onSubmit={handleSearch}
          className="flex items-center bg-gray-100 rounded-full overflow-hidden transition-all duration-300"
        >
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar..."
            className="px-4 py-2 bg-transparent outline-none w-40 md:w-60"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors mr-1"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>
      )}
    </div>
  );
}
