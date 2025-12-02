import {
  defaultEditorConfig,
  getEnabledNodes,
  sanitizeServerEditorConfig,
} from "@payloadcms/richtext-lexical";
import type { SanitizedServerEditorConfig } from "@payloadcms/richtext-lexical";
import { createHeadlessEditor } from "@payloadcms/richtext-lexical/lexical/headless";
import {
  $generateNodesFromDOM,
  $generateHtmlFromNodes,
} from "@payloadcms/richtext-lexical/lexical/html";
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  $isTextNode,
} from "@payloadcms/richtext-lexical/lexical";
import type {
  LexicalEditor,
  SerializedEditorState,
} from "@payloadcms/richtext-lexical/lexical";
import type { SanitizedConfig } from "payload";
import { JSDOM } from "jsdom";
import { Buffer } from "node:buffer";
import payloadConfigPromise from "@payload-config";
import { getPayloadInstance } from "@/services/payload-api";

let sanitizedConfigPromise: Promise<SanitizedServerEditorConfig> | null = null;
let editorPromise: Promise<LexicalEditor> | null = null;
let lexicalDom: JSDOM | null = null;

type MediaTokenKind = "image" | "youtube";

type MediaTokenPayload = {
  src: string;
  alt?: string;
  caption?: string;
  title?: string;
  width?: string | number;
  height?: string | number;
};

type MediaToken = {
  kind: MediaTokenKind;
  payload: MediaTokenPayload;
};

const MEDIA_TOKEN_REGEX = /\[\[MEDIA:(IMAGE|YOUTUBE)\|([A-Za-z0-9_-]+)\]\]/;

function encodeMediaPayload(payload: MediaTokenPayload) {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeMediaPayload(encoded: string): MediaTokenPayload | null {
  try {
    return JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

function createMediaToken(kind: MediaTokenKind, payload: MediaTokenPayload) {
  return `[[MEDIA:${kind.toUpperCase()}|${encodeMediaPayload(payload)}]]`;
}

function parseMediaToken(value: string | null | undefined): MediaToken | null {
  if (!value) return null;
  const trimmed = value.trim();
  const match = trimmed.match(
    /\[\[MEDIA:(IMAGE|YOUTUBE)\|([A-Za-z0-9_-]+)\]\]/
  );
  if (!match) return null;
  const payload = decodeMediaPayload(match[2]);
  if (!payload) return null;
  const kind = match[1].toLowerCase() as MediaTokenKind;
  return { kind, payload };
}
function ensureLexicalDom() {
  if (
    typeof (globalThis as any).window !== "undefined" &&
    typeof (globalThis as any).document !== "undefined"
  ) {
    return;
  }

  if (!lexicalDom) {
    lexicalDom = new JSDOM("<!doctype html><html><body></body></html>");
  }

  const { window } = lexicalDom;
  const globalTarget = globalThis as any;

  globalTarget.window = window;
  globalTarget.document = window.document;
  globalTarget.DOMParser = window.DOMParser;
  globalTarget.Node = window.Node;
  globalTarget.Element = window.Element;
  globalTarget.HTMLElement = window.HTMLElement;
  globalTarget.MutationObserver = window.MutationObserver;
}

type SerializedLexicalNode = {
  type: string;
  children?: SerializedLexicalNode[];
  [key: string]: any;
};

const isNonNullNode = (
  node: SerializedLexicalNode | null
): node is SerializedLexicalNode => node !== null;

const blockFromText = (text: string): SerializedLexicalNode => ({
  type: "paragraph",
  version: 1,
  format: "",
  indent: 0,
  direction: null,
  textFormat: 0,
  textStyle: "",
  children: [
    {
      type: "text",
      version: 1,
      detail: 0,
      format: 0,
      mode: "normal",
      style: "",
      text,
    },
  ],
});

// Store for resolved upload URLs (populated during async processing)
let uploadUrlCache: Map<string, { url: string; alt?: string }> = new Map();

function convertUploadNode(
  node: SerializedLexicalNode
): SerializedLexicalNode | null {
  if (node.type === "upload") {
    // Check for direct URL first (legacy format)
    let src =
      node?.src ||
      node?.imageURL ||
      node?.value?.url ||
      node?.pending?.src ||
      "";

    let alt = node?.alt || node?.value?.alt;

    // If no direct URL, check if we have a cached URL from relationTo/value
    if (!src && node?.value && node?.relationTo) {
      const cacheKey = `${node.relationTo}:${node.value}`;
      const cached = uploadUrlCache.get(cacheKey);
      if (cached) {
        src = cached.url;
        alt = alt || cached.alt;
      }
    }

    if (!src) {
      return null;
    }

    const payload: MediaTokenPayload = {
      src,
      alt,
      caption: node?.value?.caption,
      title: node?.value?.title,
    };

    return blockFromText(createMediaToken("image", payload));
  }

  if (Array.isArray(node.children)) {
    node.children = node.children.map(convertUploadNode).filter(isNonNullNode);
  }

  return node;
}

// Collect all upload node values that need to be resolved
function collectUploadIds(state: SerializedEditorState): Array<{ relationTo: string; value: string | number }> {
  const uploads: Array<{ relationTo: string; value: string | number }> = [];

  function traverse(node: SerializedLexicalNode) {
    if (node.type === "upload" && node.relationTo && node.value) {
      // Only collect if we don't have a direct URL
      if (!node.src && !node.imageURL && !node.value?.url && !node.pending?.src) {
        uploads.push({ relationTo: node.relationTo, value: node.value });
      }
    }
    if (Array.isArray(node.children)) {
      node.children.forEach(traverse);
    }
  }

  if (Array.isArray((state as any)?.root?.children)) {
    (state as any).root.children.forEach(traverse);
  }

  return uploads;
}

// Resolve upload IDs to URLs
async function resolveUploadUrls(uploads: Array<{ relationTo: string; value: string | number }>) {
  if (uploads.length === 0) return;

  const payload = await getPayloadInstance();

  for (const upload of uploads) {
    const cacheKey = `${upload.relationTo}:${upload.value}`;
    if (uploadUrlCache.has(cacheKey)) continue;

    try {
      const doc = await payload.findByID({
        collection: upload.relationTo,
        id: String(upload.value),
      });

      if (doc?.url) {
        uploadUrlCache.set(cacheKey, {
          url: doc.url,
          alt: doc.alt || ''
        });
      }
    } catch (e) {
      console.error(`Failed to resolve upload ${cacheKey}:`, e);
    }
  }
}

async function stripUnsupportedNodes(
  state: SerializedEditorState
): Promise<SerializedEditorState> {
  // First, resolve all upload IDs to URLs
  const uploads = collectUploadIds(state);
  await resolveUploadUrls(uploads);

  // Then convert upload nodes using the cached URLs
  if (Array.isArray((state as any)?.root?.children)) {
    (state as any).root.children = (state as any).root.children
      .map(convertUploadNode)
      .filter(isNonNullNode);
  }

  return state;
}

const YOUTUBE_HOST_PATTERN = /(youtube\.com|youtu\.be)/i;

function isYouTubeUrl(value: string | null | undefined) {
  return typeof value === "string" && YOUTUBE_HOST_PATTERN.test(value);
}

function normalizeYouTubeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  let parsedUrl = url.trim();
  if (!/^https?:/i.test(parsedUrl) && parsedUrl.startsWith("www.")) {
    parsedUrl = `https://${parsedUrl}`;
  }

  try {
    const target = new URL(parsedUrl);
    if (target.hostname.includes("youtu.be")) {
      const videoId = target.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
    }

    if (target.searchParams.has("v")) {
      return `https://www.youtube.com/embed/${target.searchParams.get("v")}`;
    }

    if (target.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${target.pathname}`;
    }

    if (target.hostname.includes("youtube.com") && target.pathname.length > 1) {
      const parts = target.pathname.split("/");
      const id = parts.pop();
      if (id) {
        return `https://www.youtube.com/embed/${id}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function replaceElementWithToken(element: Element, token: string) {
  const wrapper = element.ownerDocument.createElement("p");
  wrapper.textContent = token;
  element.replaceWith(wrapper);
}

function extractFigureCaption(figure: Element | null) {
  if (!figure) return "";
  const caption = figure.querySelector("figcaption");
  return caption?.textContent?.trim() || "";
}

function processImageElement(img: HTMLImageElement) {
  if (!img?.getAttribute) return;
  const src = img.getAttribute("src");
  if (!src) return;

  const figure = img.closest("figure");
  const token = createMediaToken("image", {
    src,
    alt: img.getAttribute("alt") || undefined,
    title: img.getAttribute("title") || undefined,
    width: img.getAttribute("width") || undefined,
    height: img.getAttribute("height") || undefined,
    caption: extractFigureCaption(figure),
  });

  replaceElementWithToken(figure ?? img, token);
}

function extractYouTubeUrlFromElement(
  element: Element
): { url: string; title?: string } | null {
  if (!element) return null;

  const iframe =
    element.tagName === "IFRAME"
      ? (element as HTMLIFrameElement)
      : element.querySelector("iframe");
  if (iframe) {
    const normalized = normalizeYouTubeUrl(iframe.getAttribute("src"));
    if (normalized) {
      return {
        url: normalized,
        title: iframe.getAttribute("title") || undefined,
      };
    }
  }

  const anchor = element.querySelector("a[href]") as HTMLAnchorElement | null;
  if (anchor && isYouTubeUrl(anchor.href)) {
    const normalized = normalizeYouTubeUrl(anchor.href);
    if (normalized) {
      return {
        url: normalized,
        title: anchor.textContent?.trim() || undefined,
      };
    }
  }

  const textContent = element.textContent || "";
  const lines = textContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  for (const line of lines) {
    if (isYouTubeUrl(line)) {
      const normalized = normalizeYouTubeUrl(line);
      if (normalized) {
        return { url: normalized };
      }
    }
  }

  return null;
}

function processYouTubeElement(element: Element) {
  const media = extractYouTubeUrlFromElement(element);
  if (!media) return;

  const token = createMediaToken("youtube", {
    src: media.url,
    title: media.title,
    caption: extractFigureCaption(
      element.tagName === "FIGURE" ? element : element.closest("figure")
    ),
  });

  const target =
    element.tagName === "IFRAME"
      ? element
      : element.closest("figure") || element;
  replaceElementWithToken(target, token);
}

function replaceMediaElementsWithTokens(document: Document) {
  const figures = Array.from(document.querySelectorAll("figure"));
  figures.forEach((figure) => {
    const img = figure.querySelector("img") as HTMLImageElement | null;
    if (img) {
      processImageElement(img);
      return;
    }

    const youtube = extractYouTubeUrlFromElement(figure);
    if (youtube) {
      processYouTubeElement(figure);
    }
  });

  const standaloneImages = Array.from(
    document.querySelectorAll("img")
  ) as HTMLImageElement[];
  standaloneImages.forEach((img) => {
    if (img.isConnected) {
      processImageElement(img);
    }
  });

  const iframes = Array.from(document.querySelectorAll("iframe"));
  iframes.forEach((iframe) => {
    if (iframe.isConnected && isYouTubeUrl(iframe.getAttribute("src"))) {
      processYouTubeElement(iframe);
    }
  });
}

function buildImageElement(document: Document, payload: MediaTokenPayload) {
  if (!payload.src) {
    return null;
  }

  const figure = document.createElement("figure");
  figure.className = "post-media post-media--image";

  const image = document.createElement("img");
  image.src = payload.src;
  image.alt = payload.alt || "";
  if (payload.title) {
    image.title = payload.title;
  }
  if (payload.width) {
    image.width = Number(payload.width);
  }
  if (payload.height) {
    image.height = Number(payload.height);
  }

  figure.appendChild(image);

  if (payload.caption) {
    const caption = document.createElement("figcaption");
    caption.textContent = payload.caption;
    figure.appendChild(caption);
  }

  return figure;
}

function buildYouTubeElement(document: Document, payload: MediaTokenPayload) {
  if (!payload.src) {
    return null;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "post-media post-media--youtube";

  const frame = document.createElement("div");
  frame.className = "post-media__frame";

  const iframe = document.createElement("iframe");
  iframe.src = payload.src;
  iframe.setAttribute("frameborder", "0");
  iframe.setAttribute(
    "allow",
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  );
  iframe.setAttribute("allowfullscreen", "true");
  iframe.setAttribute("loading", "lazy");
  iframe.title = payload.title || "YouTube video player";

  frame.appendChild(iframe);
  wrapper.appendChild(frame);

  if (payload.caption) {
    const caption = document.createElement("p");
    caption.className = "post-media__caption";
    caption.textContent = payload.caption;
    wrapper.appendChild(caption);
  }

  return wrapper;
}

function renderMediaTokensToHtml(html: string) {
  if (!html) return html;

  const dom = new JSDOM(`<body>${html}</body>`);
  const { document } = dom.window;
  const candidates = document.querySelectorAll("p, div, span, li");

  candidates.forEach((element: Element) => {
    if (!element.textContent) return;
    const token = parseMediaToken(element.textContent);
    if (!token) return;

    let replacement: HTMLElement | null = null;
    if (token.kind === "image") {
      replacement = buildImageElement(document, token.payload);
    } else if (token.kind === "youtube") {
      replacement = buildYouTubeElement(document, token.payload);
    }

    if (replacement) {
      element.replaceWith(replacement);
    } else {
      element.remove();
    }
  });

  return document.body.innerHTML;
}

async function getSanitizedEditorConfig() {
  if (!sanitizedConfigPromise) {
    sanitizedConfigPromise = (async () => {
      const resolvedConfig = (await payloadConfigPromise) as SanitizedConfig;
      return sanitizeServerEditorConfig(defaultEditorConfig, resolvedConfig);
    })();
  }

  return sanitizedConfigPromise;
}

async function getHeadlessEditor(): Promise<LexicalEditor> {
  if (!editorPromise) {
    editorPromise = (async () => {
      const editorConfig = await getSanitizedEditorConfig();
      return createHeadlessEditor({
        nodes: getEnabledNodes({ editorConfig }),
        editable: false,
      });
    })();
  }

  return editorPromise;
}

export async function htmlToRichText(
  content: string | null | undefined
): Promise<SerializedEditorState | null> {
  if (!content || !content.trim()) {
    return null;
  }

  const editor = await getHeadlessEditor();

  editor.update(
    () => {
      const root = $getRoot();
      root.clear();

      const dom = new JSDOM(content);
      replaceMediaElementsWithTokens(dom.window.document);
      const nodes = $generateNodesFromDOM(editor, dom.window.document);

      nodes.forEach((node) => {
        if ($isElementNode(node) || $isDecoratorNode(node)) {
          root.append(node);
          return;
        }

        const paragraph = $createParagraphNode();
        paragraph.append(node);
        root.append(paragraph);
      });
    },
    { discrete: true }
  );

  const json = editor.getEditorState().toJSON() as SerializedEditorState;
  const sanitized = await stripUnsupportedNodes(json);

  editor.update(
    () => {
      $getRoot().clear();
    },
    { discrete: true }
  );

  return sanitized;
}

export async function richTextToHtml(
  richText: SerializedEditorState | string | null | undefined
) {
  if (!richText) {
    return "";
  }

  if (typeof richText === "string") {
    return richText;
  }

  // First, resolve upload URLs and convert upload nodes to media tokens
  const processedRichText = await stripUnsupportedNodes(
    JSON.parse(JSON.stringify(richText)) // Deep clone to avoid mutation
  );

  ensureLexicalDom();
  const editor = await getHeadlessEditor();
  const editorState = editor.parseEditorState(processedRichText);
  editor.setEditorState(editorState);

  let html = "";

  editor.update(
    () => {
      html = $generateHtmlFromNodes(editor, null);
    },
    { discrete: true }
  );

  editor.update(
    () => {
      $getRoot().clear();
    },
    { discrete: true }
  );

  return renderMediaTokensToHtml(html);
}
