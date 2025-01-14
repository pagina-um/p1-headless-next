import React from "react";
import { Layout, Mail, Mic } from "lucide-react";
import { StaticBlock as StaticBlockType } from "../../types";
import { STATIC_BLOCKS } from "../../constants/blocks";
import { PodcastBlock } from "./PodcastBlock";

interface StaticBlockProps {
  block: StaticBlockType;
}

export function StaticBlock({ block }: StaticBlockProps) {
  const isNewsletterBlock = block.title.includes("newsletter");
  const isPodcastBlock = block.title.includes("podcast");

  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

  if (isNewsletterBlock) {
    return (
      <div
        className="h-full p-8 bg-primary  shadow-sm block-content"
        style={gridStyles}
      >
        <div className="flex flex-col items-center text-center text-white h-full justify-center">
          <Mail className="w-12 h-12 mb-4" />
          <h2 className="font-serif text-2xl font-bold mb-2">
            Subscreva a nossa newsletter
          </h2>
          <p className="mb-6 text-white/90">
            Antecipe as notícias que vão sair no P1.
          </p>
          <button className="px-6 py-3 bg-white text-primary font-semibold  hover:bg-gray-100 transition-colors select-text">
            Subscrever
          </button>
        </div>
      </div>
    );
  }

  if (isPodcastBlock) {
    return (
      <div
        className="lg:h-full p-6 bg-white shadow-sm border border-gray-100 block-content"
        style={gridStyles}
      >
        <PodcastBlock />
      </div>
    );
  }
}
