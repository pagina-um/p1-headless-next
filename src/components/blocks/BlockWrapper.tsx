import React, { useState } from 'react';
import { BlockSettings, BlockSettingsButton } from '../ui/BlockSettings';

interface BlockWrapperProps {
  children: React.ReactNode;
  title: string;
  gridPosition?: { width: number; height: number };
}

export function BlockWrapper({ children, title, gridPosition }: BlockWrapperProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="relative h-full preserve-3d transition-transform duration-500"
      style={{
        gridColumn: `span ${gridPosition?.width || 1}`,
        gridRow: `span ${gridPosition?.height || 1}`,
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
      }}
    >
      {/* Front side */}
      <div className="absolute inset-0 backface-hidden">
        <div className="relative h-full group">
          {children}
          <BlockSettingsButton onClick={() => setIsFlipped(true)} />
        </div>
      </div>

      {/* Back side */}
      <div 
        className="absolute inset-0 backface-hidden"
        style={{ transform: 'rotateY(180deg)' }}
      >
        <BlockSettings title={title} onClose={() => setIsFlipped(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                value={title}
                onChange={() => {}}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estilo
              </label>
              <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                <option>Padrão</option>
                <option>Compacto</option>
                <option>Destacado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordem
              </label>
              <select className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary">
                <option>Mais recentes</option>
                <option>Mais antigos</option>
                <option>Mais vistos</option>
              </select>
            </div>
          </div>
        </BlockSettings>
      </div>
    </div>
  );
}