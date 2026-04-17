import React from "react";
import { Layout, Mail, Mic, Tag } from "lucide-react";
import { StaticBlock as StaticBlockType } from "../../types";
import { STATIC_BLOCKS } from "../../constants/blocks";
import { PodcastBlock } from "./PodcastBlock";
import { DonationBlock } from "./DonationBlock";
import { PostHeader } from "../post/PostHeader";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { EditableText } from "../ui/EditableText";
import { AccountsCounterBlock } from "./AccountsCounterBlock";
import { BookPresaleBlock } from "./BookPresaleBlock";

interface StaticBlockProps {
  block: StaticBlockType;
  isAdmin: boolean;
}

export function StaticBlock({ block, isAdmin }: StaticBlockProps) {
  const isNewsletterBlock = block.type === "newsletter";
  const isPodcastBlock = block.type === "podcast";
  const isDivider = block.type === "divider";
  const isDonationBlock = block.type === "donation";
  const isAccountsCounter = block.type === "accountsCounter";
  const isBookPresale = block.type === "bookPresale";
  const isCulturaBanner = block.type === "culturaBanner";

  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

  if (isDivider) {
    return (
      <div className="flex items-end gap-1 border-b-primary-dark border-b max-sm:pl-3">
        <h2 className="font-serif text-3xl font-bold text-primary-dark ">
          {isAdmin ? (
            <EditableText
              blockUid={block.uId}
              fieldName="title"
              originalText={block.title}
            />
          ) : (
            block.title
          )}
        </h2>
      </div>
    );
  }

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
          <a
            href="https://pagina-um.kit.com/53291313d7"
            className="px-6 py-3 bg-white text-primary font-semibold  hover:bg-gray-100 transition-colors select-text"
          >
            Subscrever
          </a>
        </div>
      </div>
    );
  }

  if (isPodcastBlock) {
    return (
      <div
        className="lg:h-full p-6 bg-stone-400 shadow-sm border border-gray-100 block-content rounded-md"
        style={gridStyles}
      >
        <PodcastBlock />
      </div>
    );
  }

  if (isDonationBlock) {
    return <DonationBlock block={block} />;
  }

  if (isAccountsCounter) {
    return (
      <div
        className="h-full p-4 bg-primary  shadow-sm block-content lg:rounded-md"
        style={gridStyles}
      >
        <AccountsCounterBlock />
      </div>
    );
  }

  if (isBookPresale) {
    return (
      <div
        className="h-full p-4  block-content lg:rounded-md"
        style={gridStyles}
      >
        <BookPresaleBlock />
      </div>
    );
  }

  if (isCulturaBanner) {
    return (
      <div
        className="relative h-full overflow-hidden rounded-md border border-amber-200/60 bg-gradient-to-br from-[#f5ecd9] via-[#f0e4c7] to-[#e8d9b0] shadow-sm block-content"
        style={gridStyles}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-6 -top-10 text-[9rem] leading-none font-serif italic text-amber-900/5 select-none"
        >
          C
        </div>
        <div className="relative flex h-full flex-col justify-between p-5">
          <div>
            <p className="font-serif text-[10px] uppercase tracking-[0.35em] text-amber-800/80">
              Secção
            </p>
            <h2 className="mt-1 font-serif text-4xl font-bold leading-none text-stone-900">
              Cultura
            </h2>
          </div>
          <p className="text-xs italic text-stone-600">
            5 histórias mais recentes da grelha de Cultura (pré-visualização)
          </p>
        </div>
      </div>
    );
  }
}
