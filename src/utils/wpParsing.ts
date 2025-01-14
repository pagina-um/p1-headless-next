import { Element } from "domhandler";
import { notFound } from "next/navigation";
import parse, {
  HTMLReactParserOptions,
  domToReact,
  Element as DOMElement,
} from "html-react-parser";

const OLD_BASE_URL = "https://paginaumpt.wpcomstaging.com"; // Replace with your old domain
const NEW_BASE_URL = "/"; // Replace with your new domain

// Function to transform URLs in HTML content
export const transformContent = (content: string): string => {
  return content.replace(new RegExp(OLD_BASE_URL, "g"), NEW_BASE_URL);
};

// Parse options to transform links in parsed content
export const parserOptions: HTMLReactParserOptions = {
  replace: (domNode) => {
    if (domNode instanceof Element && "attribs" in domNode) {
      // Transform href attributes
      if (domNode.attribs.href) {
        domNode.attribs.href = domNode.attribs.href.replace(
          new RegExp(OLD_BASE_URL, "g"),
          NEW_BASE_URL
        );
      }

      // Transform src attributes
      if (domNode.attribs.src) {
        domNode.attribs.src = domNode.attribs.src.replace(
          new RegExp(OLD_BASE_URL, "g"),
          NEW_BASE_URL
        );
      }
    }
  },
};
