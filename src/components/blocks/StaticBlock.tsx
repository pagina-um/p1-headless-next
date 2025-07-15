import React from "react";
import { Layout, Mail, Mic, Tag, Handshake } from "lucide-react";
import { StaticBlock as StaticBlockType } from "../../types";
import { STATIC_BLOCKS } from "../../constants/blocks";
import { PodcastBlock } from "./PodcastBlock";
import { PostHeader } from "../post/PostHeader";
import { CategoryBlockHeader } from "./CategoryBlockHeader";
import { EditableText } from "../ui/EditableText";

interface StaticBlockProps {
  block: StaticBlockType;
  isAdmin: boolean;
}

export function StaticBlock({ block, isAdmin }: StaticBlockProps) {
  const isNewsletterBlock = block.type === "newsletter";
  const isPodcastBlock = block.type === "podcast";
  const isDivider = block.type === "divider";
  const isDonationBlock = block.type === "donation";

  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

  if (isDivider) {
    return (
      <div className="flex items-end gap-1 border-b-primary border-b max-sm:pl-3">
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
    return (
      <div
        className="h-full p-8 bg-slate-800 shadow-sm block-content @container"
        style={gridStyles}
      >
        <div className="space-y-4 max-w-4xl mx-auto flex flex-col justify-center h-full @[400px]:text-center">
          <div className="space-y-4">
            <p className="font-serif text-lg text-white">
              O jornalismo independente (só) depende dos leitores.
            </p>
            <p className="text-lg text-white">
              Não dependemos de grupos económicos nem do Estado. Não fazemos
              fretes. Fazemos jornalismo para os leitores,{" "}
              <strong className="">
                mas só sobreviveremos com o seu apoio financeiro.
              </strong>
            </p>
          </div>

          <div className="pt-4 @[400px]:flex @[400px]:justify-center">
            <a
              href="/donativos"
              className="group bg-primary hover:bg-primary-dark transition-all duration-300 rounded-lg p-4 text-center flex items-center justify-center space-x-3 w-full max-w-96 @[400px]:mx-0"
            >
              <Handshake className="w-6 h-6 group-hover:scale-110 transition-transform duration-300 stroke-white" />
              <span className="text-xl font-bold text-white">Contribuir</span>
            </a>
          </div>
        </div>
      </div>
    );
  }
}
