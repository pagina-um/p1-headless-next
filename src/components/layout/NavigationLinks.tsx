import React from "react";
import { NavigationItem } from "./NavigationItem";
import { useNavigation } from "../../hooks/useNavigation";

interface NavigationLinksProps {
  orientation?: "horizontal" | "vertical";
  onItemClick?: () => void;
}

export function NavigationLinks({
  orientation = "horizontal",
  onItemClick,
}: NavigationLinksProps) {
  const { links } = useNavigation();

  return (
    <ul
      className={`
        flex text-sm font-light
        ${orientation === "vertical" ? "flex-col gap-3" : "items-center gap-6"}
      `}
    >
      {links.map((link) => (
        <NavigationItem
          key={link.label}
          {...link}
          orientation={orientation}
          onClick={onItemClick}
        />
      ))}
    </ul>
  );
}
