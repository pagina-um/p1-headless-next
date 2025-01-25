import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isString } from "util";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function titleCaseExceptForSomeWords(str?: string) {
  if (!isString(str)) return str;
  return str
    .split(" ")
    .map((word) => {
      if (["com", "de", "do", "da"].includes(word.toLowerCase())) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
