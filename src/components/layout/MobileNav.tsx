"use client";

import React from "react";
import { Menu, Handshake } from "lucide-react";
import Link from "next/link";
import { NavigationLinks } from "./NavigationLinks";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6 dark:text-gray-200" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="mt-8">
          <SheetClose asChild>
            <Link
              href="/donativos"
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white font-medium rounded-lg transition-colors"
            >
              <Handshake className="w-5 h-5" />
              Contribuir
            </Link>
          </SheetClose>
        </div>
        <nav className="mt-6 flex-1 overflow-y-auto min-h-0">
          <NavigationLinks orientation="vertical" />
        </nav>
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Modo nocturno</span>
          <ThemeToggle />
        </div>
      </SheetContent>
    </Sheet>
  );
}
