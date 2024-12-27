import { SPECIAL_CATEGORIES } from "../constants/categories";
import type { WPPost } from "../types/wordpress";

export function shouldShowAuthor(categoryId: number): boolean {
  return categoryId === SPECIAL_CATEGORIES.OPINION;
}

export function shouldShowDate(categoryId: number): boolean {
  return categoryId !== SPECIAL_CATEGORIES.OPINION;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-PT", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
