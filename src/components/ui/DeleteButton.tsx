import React from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onClick: () => void;
}

export function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
      title="Remover"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}