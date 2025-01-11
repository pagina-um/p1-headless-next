interface Episode {
  title: string | null;
  description: string | null;
  pubDate: string | null;
  duration: string | null;
  explicit: string | null;
  episode: string | null;
  season: string | null;
  episodeType: string | null;
  enclosure: {
    url: string | null;
    length: string | null;
    type: string | null;
  };
  guid: string | null;
  link: string | null;
  image: string | null;
}

interface PodcastFeed {
  title: string | null;
  description: string | null;
  author: string | null;
  language: string | null;
  link: string | null;
  image: string | null;
  copyright: string | null;
  lastBuildDate: string | null;
  categories: string[];
  episodes: Episode[];
}

interface ParseResult {
  success: boolean;
  data: PodcastFeed | null;
  error?: string;
}

function getElementByTagNameNS(
  element: Element,
  namespace: string,
  localName: string
): Element | null {
  const elements = element.getElementsByTagNameNS(namespace, localName);
  return elements.length > 0 ? elements[0] : null;
}

function getTextContentNS(
  element: Element,
  namespace: string,
  localName: string
): string | null {
  const node = getElementByTagNameNS(element, namespace, localName);
  return node?.textContent ?? null;
}

function parsePodcastFeed(xmlString: string): PodcastFeed {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Define namespaces
  const ITUNES_NS = "http://www.itunes.com/dtds/podcast-1.0.dtd";

  const channel = xmlDoc.getElementsByTagName("channel")[0];
  if (!channel) {
    throw new Error("Invalid podcast feed: missing channel element");
  }

  const podcastInfo: PodcastFeed = {
    title: getTextContent(channel, "title"),
    description: getTextContent(channel, "description"),
    author: getTextContentNS(channel, ITUNES_NS, "author"),
    language: getTextContent(channel, "language"),
    link: getTextContent(channel, "link"),
    image:
      getTextContentNS(channel, ITUNES_NS, "image") ??
      getTextContent(channel, "image url"),
    copyright: getTextContent(channel, "copyright"),
    lastBuildDate: getTextContent(channel, "lastBuildDate"),
    categories: Array.from(
      channel.getElementsByTagNameNS(ITUNES_NS, "category")
    )
      .map((category) => category.getAttribute("text") ?? "")
      .filter(Boolean),
    episodes: [],
  };

  const items = channel.getElementsByTagName("item");
  podcastInfo.episodes = Array.from(items).map((item) => {
    // Helper function to get iTunes namespaced content for this item
    const getItunesContent = (localName: string) => {
      const elements = item.getElementsByTagNameNS(ITUNES_NS, localName);
      return elements.length > 0 ? elements[0].textContent : null;
    };

    return {
      title: getTextContent(item, "title"),
      description: getTextContent(item, "description"),
      pubDate: getTextContent(item, "pubDate"),
      duration: getItunesContent("duration"),
      explicit: getItunesContent("explicit"),
      episode: getItunesContent("episode"),
      season: getItunesContent("season"),
      episodeType: getItunesContent("episodeType"),
      enclosure: {
        url: getAttribute(item, "enclosure", "url"),
        length: getAttribute(item, "enclosure", "length"),
        type: getAttribute(item, "enclosure", "type"),
      },
      guid: getTextContent(item, "guid"),
      link: getTextContent(item, "link"),
      image:
        item
          .getElementsByTagNameNS(ITUNES_NS, "image")[0]
          ?.getAttribute("href") ?? null,
    };
  });

  return podcastInfo;
}

// Keep the original getTextContent for non-namespaced elements
function getTextContent(element: Element, selector: string): string | null {
  const node = element.querySelector(selector);
  return node?.textContent ?? null;
}

function getAttribute(
  element: Element,
  selector: string,
  attr: string
): string | null {
  const node = element.querySelector(selector);
  return node?.getAttribute(attr) ?? null;
}

function safeParsePodcastFeed(xmlString: string): ParseResult {
  try {
    const result = parsePodcastFeed(xmlString);

    // Validate essential fields
    if (!result.title) {
      throw new Error("Invalid podcast feed: missing title");
    }

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      data: null,
    };
  }
}

export type { Episode, PodcastFeed, ParseResult };
export { safeParsePodcastFeed };
