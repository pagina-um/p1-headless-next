import { generateObject } from "ai";
import { z } from "zod";
import { cutAtSentence } from "@/utils/xPromoText";

/** Helpers shared by the social-promotion draft routes (X, Facebook). */

export function stripTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .trim();
}

/** AI SDK errors arrive colourised for a terminal; the dialog is not one. */
export function plainErrorMessage(message: string): string {
  return message.replace(/\u001b\[[0-9;]*m/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Bring an over-long draft under the limit. Models can't count characters, so
 * an overshoot is routine — but cutting the text leaves the editor with a post
 * that stops mid-sentence, so ask for a rewrite first and only cut as a last
 * resort, at a sentence boundary and with the editor told it happened.
 */
export async function fitToLimit(
  model: string,
  text: string,
  max: number,
  kind: string
): Promise<{ text: string; cut: boolean }> {
  if (text.length <= max) return { text, cut: false };

  try {
    const { object } = await generateObject({
      model,
      schema: z.object({ text: z.string() }),
      system:
        "Reescreves textos jornalísticos para caberem num limite de " +
        "caracteres, sem os empobrecer.",
      prompt:
        `Este texto de ${kind} tem ${text.length} caracteres e o limite é ` +
        `${max}. Reescreve-o com ${max} caracteres ou menos.\n\n` +
        "Regras: mantém o facto principal e os nomes próprios; corta o que " +
        "for acessório em vez de encurtar as frases até ficarem telegráficas; " +
        "devolve frases completas e pontuadas; mesmo registo, português " +
        "europeu; sem link, sem hashtags, sem emojis; sem travessões " +
        "(apartes vão entre vírgulas ou em frase própria).\n\n" +
        `Texto:\n${text}`,
    });
    const rewritten = object.text.trim();
    if (rewritten && rewritten.length <= max) return { text: rewritten, cut: false };
    return { text: cutAtSentence(rewritten || text, max), cut: true };
  } catch (e) {
    console.error("[promo] rewrite to fit failed", e);
    return { text: cutAtSentence(text, max), cut: true };
  }
}
