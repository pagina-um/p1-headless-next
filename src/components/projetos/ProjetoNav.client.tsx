"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export interface ProjetoNavItem {
  label: string;
  /** Caminho absoluto, por exemplo "/projetos/arquivo/casos". */
  href: string;
}

export function ProjetoNav({
  items,
  color,
}: {
  items: ProjetoNavItem[];
  color: string;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Secções do projeto" className="border-t border-gray-200">
      <ul className="max-w-7xl mx-auto px-4 flex gap-6 overflow-x-auto">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={twMerge(
                  "block py-3 border-b-2 border-transparent text-[12px] uppercase tracking-wider text-stone-500 transition-colors hover:text-stone-900",
                  active && "text-stone-900"
                )}
                style={active ? { borderColor: color } : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
