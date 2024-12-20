import React from 'react';
import { Tag } from 'lucide-react';

interface CategoryBlockHeaderProps {
  title: string;
}

export function CategoryBlockHeader({ title }: CategoryBlockHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold capitalize">
          {title}
        </h2>
      </div>
    </div>
  );
}