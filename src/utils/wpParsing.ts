import { HTMLReactParserOptions } from "html-react-parser";

const OLD_BASE_URL = process.env.NEXT_PUBLIC_WP_URL || "";
const NEW_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";
const OLD_MEDIA_PATH = `${OLD_BASE_URL}/wp-content/uploads/`;
const NEW_MEDIA_PATH = `${NEW_BASE_URL}/media/`;

export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if ("attribs" in domNode) {
      if (domNode.name === "a" && domNode.attribs.href) {
        // Transform both /wp-content/uploads/ and full URL with wp-content/uploads
        if (
          domNode.attribs.href.includes("/wp-content/uploads/") ||
          domNode.attribs.href.includes(OLD_MEDIA_PATH)
        ) {
          // First replace the full URL pattern if it exists
          let newHref = domNode.attribs.href.replace(
            new RegExp(OLD_MEDIA_PATH, "g"),
            NEW_MEDIA_PATH
          );
          // Then catch any remaining /wp-content/uploads/ patterns
          newHref = newHref.replace(
            new RegExp("/wp-content/uploads/", "g"),
            "/media/"
          );
          domNode.attribs.href = newHref;
        } else {
          // Regular internal link
          domNode.attribs.href = domNode.attribs.href.replace(
            new RegExp(OLD_BASE_URL, "g"),
            NEW_BASE_URL
          );
        }
      }

      // Handle images with same logic
      if (domNode.name === "img" && domNode.attribs.src) {
        let newSrc = domNode.attribs.src.replace(
          new RegExp(OLD_MEDIA_PATH, "g"),
          NEW_MEDIA_PATH
        );
        newSrc = newSrc.replace(
          new RegExp("/wp-content/uploads/", "g"),
          "/media/"
        );
        domNode.attribs.src = newSrc;
      }

      // Handle srcset with same logic
      if (domNode.attribs.srcset) {
        domNode.attribs.srcset = domNode.attribs.srcset
          .split(",")
          .map((src) => {
            const [url, size] = src.trim().split(" ");
            let newUrl = url.replace(
              new RegExp(OLD_MEDIA_PATH, "g"),
              NEW_MEDIA_PATH
            );
            newUrl = newUrl.replace(
              new RegExp("/wp-content/uploads/", "g"),
              "/media/"
            );
            return `${newUrl} ${size || ""}`.trim();
          })
          .join(", ");
      }
    }
  },
};
