import React from "react";
import { Handshake } from "lucide-react";
import { StaticBlock as StaticBlockType } from "../../types";

interface DonationBlockProps {
  block: StaticBlockType;
}

export function DonationBlock({ block }: DonationBlockProps) {
  const gridStyles = {
    gridColumn: `span ${block.gridPosition?.width || 1}`,
    gridRow: `span ${block.gridPosition?.height || 1}`,
  };

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
