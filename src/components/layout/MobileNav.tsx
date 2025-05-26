import React from "react";
import { X } from "lucide-react";
import { NavigationLinks } from "./NavigationLinks";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  return (
    <div
      className={`
        fixed inset-0 bg-white z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close menu"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="px-6 py-4">
        <NavigationLinks orientation="vertical" onItemClick={onClose} />
      </nav>
    </div>
  );
}
