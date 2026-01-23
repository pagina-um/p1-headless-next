"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Logo } from "../ui/Logo";
import { DesktopNav } from "./DesktopNav";
import { MobileNav } from "./MobileNav";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import Link from "next/link";
import { SearchButton } from "./SearchButton";

export function Header() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const { isScrolled } = useScrollHeader();
  const pathname = usePathname();
  const isAdmin = pathname === "/admin";

  return (
    <>
      <header
        className={`
          bg-white border-b border-gray-200
          fixed top-0 left-0 right-0 z-40
          transition-all duration-300
          ${isScrolled ? "shadow-md" : ""}
        `}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div
            className={`
              flex items-center justify-between gap-2 md:gap-8
              transition-all duration-300
              ${isScrolled ? "h-14 md:h-16" : "h-16 md:h-24"}
            `}
          >
            {/* Mobile menu button + sheet */}
            {!isAdmin && <MobileNav />}

            <div className={`flex-1 min-w-0 overflow-hidden flex flex-col md:items-start transition-all duration-300 ${isSearchExpanded ? "items-end" : "items-center"}`}>
              <div
                className={`
                  transition-all duration-300
                  ${
                    isScrolled
                      ? "w-[140px] md:w-[200px]"
                      : "w-[160px] md:w-[280px]"
                  }
                `}
              >
                <Link href={"/"}>
                  <Logo />
                </Link>
              </div>
            </div>

            {!isAdmin && (
              <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
                <DesktopNav />
                <SearchButton />
              </div>
            )}

            {/* Admin back button */}
            {isAdmin && (
              <Link
                prefetch={false}
                href={"/"}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
                title={"Back to Site"}
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
                <span className="text-sm font-medium text-gray-600 hidden sm:inline">
                  Back to Site
                </span>
              </Link>
            )}
            {!isAdmin && (
              <div className="md:hidden flex items-center flex-shrink-0">
                <SearchButton onExpandChange={setIsSearchExpanded} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer div that matches header height */}
      <div
        className={`
          transition-all duration-300
          ${isScrolled ? "h-14 md:h-16" : "h-16 md:h-24"}
        `}
      />
    </>
  );
}
