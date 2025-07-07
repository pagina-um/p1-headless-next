import React from "react";
import { Layout, Mail, Plus, Handshake } from "lucide-react";
import { STATIC_BLOCKS } from "../../constants/blocks";

interface StaticBlockCreatorProps {
  onCreateBlock: (
    title: "newsletter" | "podcast" | "divider" | "donation"
  ) => void;
}

export function StaticBlockCreator({ onCreateBlock }: StaticBlockCreatorProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <Layout className="w-5 h-5" />
        Blocos Estáticos
      </h3>

      <div className="grid gap-3">
        {Object.values(STATIC_BLOCKS).map((block) => (
          <button
            key={block.type}
            onClick={() => onCreateBlock(block.type)}
            className="flex items-start gap-4 p-4 bg-gray-50  hover:bg-gray-100 transition-colors text-left group"
          >
            <div className="mt-1">
              {block.type === "newsletter" ? (
                <Mail className="w-5 h-5 text-primary" />
              ) : block.type === "donation" ? (
                <Handshake className="w-5 h-5 text-primary" />
              ) : (
                <Layout className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-medium">{block.title}</h4>
                <span className="text-xs px-2 py-1 bg-white rounded-full flex items-center gap-1 text-gray-600 group-hover:bg-gray-200 transition-colors">
                  <Plus className="w-3 h-3" />
                  Adicionar
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{block.content}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
