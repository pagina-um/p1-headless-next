import { CustomPostFields, ObjectPosition, StoryBlock } from "@/types";
import { SPECIAL_CATEGORIES, SPECIAL_STYLES } from "../constants/categories";

export function shouldShowAuthor(categoryId: number): boolean {
  return categoryId === SPECIAL_CATEGORIES.OPINION;
}

export function shouldHaveDifferentStyles(categoryId: number): boolean {
  return categoryId === SPECIAL_STYLES.INTERVIEW;
}

export function shouldShowDate(categoryId: number): boolean {
  return categoryId !== SPECIAL_CATEGORIES.OPINION;
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("pt-PT");
}

export function or<T>(a: T | null | undefined, b: T): T {
  if (a === null || a === undefined) return b;
  if (typeof a === "string") return a;
  return a || b;
}

export function extractStoryData(data: any, story: StoryBlock) {
  const {
    title: overrideTitle,
    chamadaDestaque: overrideChamadaDestaque,
    chamadaManchete: overrideChamadaManchete,
    antetitulo: overrideAntetitulo,
  } = story;
  const {
    post: { author, featuredImage, uri, title, date },
  } = data;

  const postFields: CustomPostFields = data.post
    ?.postFields as CustomPostFields;

  const overridePostFields = {
    antetitulo: or(overrideAntetitulo, postFields.antetitulo),
    chamadaDestaque: or(overrideChamadaDestaque, postFields.chamadaDestaque),
    chamadaManchete: or(overrideChamadaManchete, postFields.chamadaManchete),
  };

  const finalTitle = or(overrideTitle, title);
  return {
    date,
    overridePostFields,
    author,
    featuredImage,
    uri,
    finalTitle,
  };
}

export const positionMap = {
  top: "top",
  bottom: "bottom",
  center: "center",
  left: "left",
  right: "right",
} as const;

export const objectPositions = Object.keys(positionMap) as ObjectPosition[];
