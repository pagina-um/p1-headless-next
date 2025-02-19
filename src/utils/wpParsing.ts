import { HTMLReactParserOptions } from "html-react-parser";

const OLD_BASE_URL = process.env.NEXT_PUBLIC_WP_URL || "";
const NEW_BASE_URL = `https://${process.env.VERCEL_URL}` || "";
const OLD_MEDIA_PATH = `${OLD_BASE_URL}/wp-content/uploads/`;
const NEW_MEDIA_PATH = `${NEW_BASE_URL}/media/`;

export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if ("attribs" in domNode) {
      // Transform href attributes in links
      if (domNode.name === "a" && domNode.attribs.href) {
        domNode.attribs.href = domNode.attribs.href.replace(
          new RegExp(OLD_BASE_URL, "g"),
          NEW_BASE_URL
        );
      }

      // Transform src attributes in images
      if (
        (domNode.name === "img" || domNode.name === "source") &&
        domNode.attribs.src
      ) {
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
