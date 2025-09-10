import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function titleCaseExceptForSomeWords(str?: string) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => {
      if (["com", "de", "do", "da", "na", "e"].includes(word.toLowerCase()))
        return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
