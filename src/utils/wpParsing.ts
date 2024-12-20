import { HTMLReactParserOptions } from "html-react-parser";

const OLD_BASE_URL = "https://paginaumpt.wpcomstaging.com"; // Replace with your old domain
const NEW_BASE_URL = ""; // become internal links

// Function to transform URLs in HTML content

// Parse options to transform links in parsed content
export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if ("attribs" in domNode && domNode.name === "a") {
      // Transform href attributes
      if (domNode.attribs.href) {
        domNode.attribs.href = domNode.attribs.href.replace(
          new RegExp(OLD_BASE_URL, "g"),
          NEW_BASE_URL
        );
      }
    }
  },
};
