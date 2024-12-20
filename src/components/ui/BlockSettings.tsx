import React from "react";
import { MoreVertical, X, ArrowLeft, Trash2 } from "lucide-react";

interface BlockSettingsPanelProps {
  title: string;
  onClose: () => void;
  onDelete: () => void;
  children: React.ReactNode;
}

export function BlockSettingsPanel({
  title,
  onClose,
  onDelete,
  children,
}: BlockSettingsPanelProps) {
  return (
    <div className="absolute inset-0 bg-white  shadow-lg p-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          {title}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={onDelete}
            className="p-1 hover:bg-red-100 text-red-600 rounded-full transition-colors"
            title="Remover"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export function BlockSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
      title="Configurações"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
  );
}
