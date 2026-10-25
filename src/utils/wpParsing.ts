import { WP_URL } from "@/services/config";
import { HTMLReactParserOptions } from "html-react-parser";
import React from "react";
import Image from "next/image";
import { Element } from "html-react-parser";

const OLD_BASE_URL = WP_URL || "";
const NEW_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://paginaum.pt/";
const OLD_MEDIA_PATH = `${OLD_BASE_URL}/wp-content/uploads/`;
const NEW_MEDIA_PATH = `${NEW_BASE_URL}/media/`;

const SITE_HOSTS = new Set(["paginaum.pt", "www.paginaum.pt"]);
// The WP backend host is rewritten to paginaum.pt above, but list it too so a
// link the rewrite misses (different scheme, trailing path quirks) still
// counts as internal.
try {
  if (OLD_BASE_URL) SITE_HOSTS.add(new URL(OLD_BASE_URL).hostname.toLowerCase());
} catch {
  // WP_URL unset or malformed; nothing to add.
}

/**
 * True for links that leave the site. Relative URLs, anchors, mailto/tel and
 * anything on paginaum.pt are internal. Evaluated after the href rewrite, so
 * links that still point at the WP backend host count as internal.
 */
function isExternalLink(href: string): boolean {
  if (!/^https?:\/\//i.test(href)) return false;
  try {
    const host = new URL(href).hostname.toLowerCase();
    return !SITE_HOSTS.has(host) && !host.endsWith(".paginaum.pt");
  } catch {
    return false;
  }
}

export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && domNode.attribs) {
      // Transform links and downloads
      if (domNode.name === "a") {
        // Handle href
        if (domNode.attribs.href) {
          if (domNode.attribs.href.includes("/wp-content/uploads/")) {
            domNode.attribs.href = domNode.attribs.href.replace(
              new RegExp(OLD_MEDIA_PATH, "g"),
              NEW_MEDIA_PATH
            );
          } else {
            domNode.attribs.href = domNode.attribs.href.replace(
              new RegExp(OLD_BASE_URL, "g"),
              NEW_BASE_URL
            );
          }
        }
        // External links open in a new tab regardless of whether the editor
        // ticked "Open in new tab" in WordPress; the block editor has no way
        // to make that the default.
        if (domNode.attribs.href && isExternalLink(domNode.attribs.href)) {
          domNode.attribs.target = "_blank";
          domNode.attribs.rel = "noopener noreferrer";
        }
        // Handle download attribute if present
        if (domNode.attribs.download) {
          domNode.attribs.download = domNode.attribs.download.replace(
            new RegExp(OLD_MEDIA_PATH, "g"),
            NEW_MEDIA_PATH
          );
        }
      }

      // Handle images
      if (domNode.name === "img" && domNode.attribs.src) {
        const src = domNode.attribs.src.replace(
          new RegExp(OLD_MEDIA_PATH, "g"),
          NEW_MEDIA_PATH
        );
        const alt = domNode.attribs.alt || "";
        const width = domNode.attribs.width
          ? parseInt(domNode.attribs.width, 10)
          : 800;
        const height = domNode.attribs.height
          ? parseInt(domNode.attribs.height, 10)
          : 600;
        return React.createElement(Image, {
          src,
          alt,
          width,
          height,
          style: { height: "auto", maxWidth: "100%" },
          sizes: "(max-width: 768px) 100vw, 800px",
          loading: "lazy",
          decoding: "async",
          className: "rounded-lg my-6",
        });
      }

      // Handle srcset
      if (domNode.attribs.srcset) {
        domNode.attribs.srcset = domNode.attribs.srcset
          .split(",")
          .map((src) => {
            const [url, size] = src.trim().split(" ");
            const newUrl = url.replace(
              new RegExp(OLD_MEDIA_PATH, "g"),
              NEW_MEDIA_PATH
            );
            return `${newUrl} ${size || ""}`.trim();
          })
          .join(", ");
      }
    }
  },
};
