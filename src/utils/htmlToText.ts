/**
 * Converts HTML content to plain text suitable for TTS consumption.
 * Strips tags, removes figures/scripts/styles, decodes entities, removes URLs.
 */

const FOOTER_SIGNATURE = `<p><strong>PÁGINA UM &#8211; <em>O jornalismo independente (só) depende dos leitores.</em></strong></p>`;

/**
 * Strip HTML content to plain text for TTS.
 * Prepends the article title as a spoken intro.
 */
export function htmlToTtsText(html: string, title: string): string {
  // Remove footer signature (same split as PostContent.tsx)
  let text = html.split(FOOTER_SIGNATURE)[0];

  // Remove <figure> tags and their content (images, captions)
  text = text.replace(/<figure[\s\S]*?<\/figure>/gi, "");

  // Remove <script> tags and their content
  text = text.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove <style> tags and their content
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");

  // Remove <iframe> tags
  text = text.replace(/<iframe[\s\S]*?<\/iframe>/gi, "");

  // Replace block-level elements with newlines for sentence detection
  text = text.replace(/<\/(p|div|h[1-6]|li|blockquote|br\s*\/?)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Strip all remaining HTML tags
  text = text.replace(/<[^>]+>/g, "");

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Remove URLs (they sound bad when read aloud)
  text = text.replace(/https?:\/\/[^\s)]+/g, "");

  // Normalize whitespace: collapse multiple spaces/tabs into single space
  text = text.replace(/[ \t]+/g, " ");

  // Normalize newlines: collapse multiple into single
  text = text.replace(/\n\s*\n/g, "\n");

  // Trim each line
  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  // Prepend title as spoken intro
  return `${title}.\n\n${text}`;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#039;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&#8211;": "–",
    "&#8212;": "—",
    "&#8220;": "\u201C",
    "&#8221;": "\u201D",
    "&#8216;": "\u2018",
    "&#8217;": "\u2019",
    "&#8230;": "\u2026",
    "&ndash;": "–",
    "&mdash;": "—",
    "&ldquo;": "\u201C",
    "&rdquo;": "\u201D",
    "&lsquo;": "\u2018",
    "&rsquo;": "\u2019",
    "&hellip;": "\u2026",
    "&eacute;": "é",
    "&Eacute;": "É",
    "&atilde;": "ã",
    "&Atilde;": "Ã",
    "&otilde;": "õ",
    "&Otilde;": "Õ",
    "&aacute;": "á",
    "&Aacute;": "Á",
    "&oacute;": "ó",
    "&Oacute;": "Ó",
    "&iacute;": "í",
    "&Iacute;": "Í",
    "&uacute;": "ú",
    "&Uacute;": "Ú",
    "&ccedil;": "ç",
    "&Ccedil;": "Ç",
    "&agrave;": "à",
    "&Agrave;": "À",
    "&acirc;": "â",
    "&Acirc;": "Â",
    "&ecirc;": "ê",
    "&Ecirc;": "Ê",
    "&ocirc;": "ô",
    "&Ocirc;": "Ô",
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replaceAll(entity, char);
  }

  // Handle numeric entities (decimal)
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 10))
  );

  // Handle numeric entities (hex)
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
    String.fromCharCode(parseInt(code, 16))
  );

  return result;
}
