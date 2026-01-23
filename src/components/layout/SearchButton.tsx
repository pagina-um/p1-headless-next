"use client";

import { Search, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "nextjs-toploader/app";

interface SearchButtonProps {
  onExpandChange?: (expanded: boolean) => void;
}

export function SearchButton({ onExpandChange }: SearchButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const setExpanded = (value: boolean) => {
    setIsExpanded(value);
    onExpandChange?.(value);
  };
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setExpanded(false);
      setSearchQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      <form
        onSubmit={handleSearch}
        className={`
          flex items-center bg-gray-100 rounded-full overflow-hidden
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-[200px] sm:w-[260px] opacity-100" : "w-0 opacity-0"}
        `}
      >
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Pesquisar..."
          tabIndex={isExpanded ? 0 : -1}
          className="flex-1 min-w-0 px-4 py-2 bg-transparent outline-none text-sm"
        />
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setSearchQuery("");
          }}
          tabIndex={isExpanded ? 0 : -1}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors mr-1"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </form>
      <button
        onClick={() => setExpanded(true)}
        className={`
          p-2 hover:bg-gray-100 rounded-full transition-all duration-300
          ${isExpanded ? "scale-0 w-0 opacity-0" : "scale-100 opacity-100"}
        `}
        aria-label="Search"
      >
        <Search className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
