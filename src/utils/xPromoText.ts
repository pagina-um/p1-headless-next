/**
 * Last-resort trim for an X post whose text is over the character limit.
 *
 * Only reached when the model has already been asked to rewrite the draft
 * shorter and failed, so the priority is that whatever the editor sees reads
 * as finished rather than as a bug: end on the last complete sentence, and
 * where there is no sentence to end on, mark the cut with an ellipsis instead
 * of stopping mid-word.
 */
export function cutAtSentence(text: string, max: number): string {
  if (text.length <= max) return text;

  const cut = text.slice(0, max);
  const lastSentence = Math.max(
    cut.lastIndexOf(". "),
    cut.lastIndexOf("? "),
    cut.lastIndexOf("! ")
  );
  // A complete short post beats a longer one that stops mid-sentence, so take
  // any sentence boundary that leaves a usable post rather than holding out
  // for one near the limit.
  if (lastSentence > max * 0.3) return cut.slice(0, lastSentence + 1).trim();
  if (/[.!?]$/.test(cut.trim())) return cut.trim();

  const lastSpace = cut.lastIndexOf(" ");
  const words = (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim();
  return `${words.replace(/[,;:]$/, "")}…`.slice(0, max);
}
