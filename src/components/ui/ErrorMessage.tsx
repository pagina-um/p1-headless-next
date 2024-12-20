import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="flex items-center gap-2 text-red-600 p-4 bg-red-50 ">
      <AlertTriangle className="w-5 h-5" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
