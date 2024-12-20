import { Newspaper } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500">
      <Newspaper className="w-16 h-16 mb-4 opacity-50" />
      <p className="text-lg">{message}</p>
    </div>
  );
}