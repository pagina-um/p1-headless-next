import React from "react";
import { Tag } from "lucide-react";
import Link from "next/link";

interface CategoryBlockHeaderProps {
  title: string;
  link: string;
}

export function CategoryBlockHeader({ title, link }: CategoryBlockHeaderProps) {
  return (
    <div className="flex items-end justify-between mb-2 pb-1 px-2 lg:px-0">
      <div className="flex items-center gap-2">
        <Tag className="w-5 h-5 text-primary" />
        <h2 className="font-serif text-2xl font-bold capitalize">{title}</h2>
      </div>
      <Link href={link} className="underline text-sm text-gray-500">
        Ver tudo
      </Link>
    </div>
  );
}
