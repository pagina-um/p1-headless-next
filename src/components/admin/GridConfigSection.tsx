import React from "react";
import { GridConfig } from "../../types";
import { BlocksTabs } from "./BlocksTabs";

interface GridConfigSectionProps {
  config: GridConfig;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateCategoryBlock: (categoryId: number, title: string) => void;
  onCreateStaticBlock: (block: { title: string; content: string }) => void;
}

export function GridConfigSection({
  config,
  onChange,
  onCreateCategoryBlock,
  onCreateStaticBlock,
}: GridConfigSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-3">Configuração da Grelha</h2>
        <div className="flex gap-4 items-center bg-gray-50 p-3 ">
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Colunas
            </label>
            <input
              type="number"
              name="columns"
              value={config.columns}
              onChange={onChange}
              min="1"
              max="6"
              className="w-full h-8 px-2 rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Linhas
            </label>
            <input
              type="number"
              name="rows"
              value={config.rows}
              onChange={onChange}
              min="1"
              max="8"
              className="w-full h-8 px-2 rounded border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <BlocksTabs
          onCreateCategoryBlock={onCreateCategoryBlock}
          onCreateStaticBlock={onCreateStaticBlock}
        />
      </div>
    </div>
  );
}
