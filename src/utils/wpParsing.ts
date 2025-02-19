import { HTMLReactParserOptions } from "html-react-parser";

const OLD_BASE_URL = process.env.NEXT_PUBLIC_WP_URL || "";
const NEW_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
const OLD_MEDIA_PATH = `${OLD_BASE_URL}/wp-content/uploads/`;
const NEW_MEDIA_PATH = `${NEW_BASE_URL}/media/`;

export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if ("attribs" in domNode) {
      // Transform all links (both internal and to files)
      if (domNode.name === "a" && domNode.attribs.href) {
        // Check if it's a link to an upload
        if (domNode.attribs.href.includes("/wp-content/uploads/")) {
          domNode.attribs.href = domNode.attribs.href.replace(
            new RegExp(OLD_MEDIA_PATH, "g"),
            NEW_MEDIA_PATH
          );
        } else {
          // Regular internal link
          domNode.attribs.href = domNode.attribs.href.replace(
            new RegExp(OLD_BASE_URL, "g"),
            NEW_BASE_URL
          );
        }
      }

      // Handle images - just transform the src
      if (domNode.name === "img" && domNode.attribs.src) {
        domNode.attribs.src = domNode.attribs.src.replace(
          new RegExp(OLD_MEDIA_PATH, "g"),
          NEW_MEDIA_PATH
        );
      }

      // Handle srcset if present
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
