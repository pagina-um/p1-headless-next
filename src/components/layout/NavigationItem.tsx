import React from "react";

interface NavigationItemProps {
  href: string;
  label: string;
  orientation?: "horizontal" | "vertical";
  onClick?: () => void;
}

export function NavigationItem({
  href,
  label,
  orientation,
  onClick,
}: NavigationItemProps) {
  return (
    <li>
      <a
        href={href}
        onClick={onClick}
        className={`
          text-gray-900 hover:text-primary transition-colors
          ${orientation === "vertical" ? "text-lg block py-2" : ""}
        `}
      >
        {label}
      </a>
    </li>
  );
}
