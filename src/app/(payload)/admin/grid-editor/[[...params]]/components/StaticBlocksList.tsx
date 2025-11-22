"use client";

import { useGrid } from "@/components/ui/GridContext";
import { STATIC_BLOCK_TYPES, StaticBlockType } from "@/types";

const STATIC_BLOCK_OPTIONS = [
  { type: "newsletter", label: "Newsletter Signup", icon: "📧", description: "Email subscription form" },
  { type: "podcast", label: "Podcast Player", icon: "🎙️", description: "Embedded podcast player" },
  { type: "donation", label: "Donation Box", icon: "💝", description: "Support/donate call-to-action" },
  { type: "divider", label: "Visual Divider", icon: "〰️", description: "Section separator" },
  { type: "accountsCounter", label: "Accounts Counter", icon: "📊", description: "Statistics display" },
  { type: "bookPresale", label: "Book Presale", icon: "📚", description: "Book promotion block" },
] as const;

export function StaticBlocksList() {
  const { handleCreateStaticBlock } = useGrid();

  return (
    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
      {STATIC_BLOCK_OPTIONS.map((block) => (
        <button
          key={block.type}
          onClick={() => handleCreateStaticBlock(block.type as StaticBlockType)}
          className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-3">
            <span className="text-3xl">{block.icon}</span>

            <div className="flex-1">
              <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">
                {block.label}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{block.description}</p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
