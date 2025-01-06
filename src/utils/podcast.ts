export interface Episode {
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

export interface PodcastFeed {
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

function parsePodcastFeed(xmlString: string): PodcastFeed {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  const channel = xmlDoc.querySelector("channel");
  if (!channel) {
    throw new Error("Invalid podcast feed: missing channel element");
  }

  const podcastInfo: PodcastFeed = {
    title: getTextContent(channel, "title"),
    description: getTextContent(channel, "description"),
    author: getTextContent(channel, "itunes\\:author"),
    language: getTextContent(channel, "language"),
    link: getTextContent(channel, "link"),
    image:
      getAttribute(channel, "itunes\\:image", "href") ??
      getTextContent(channel, "image url"),
    copyright: getTextContent(channel, "copyright"),
    lastBuildDate: getTextContent(channel, "lastBuildDate"),
    categories: Array.from(channel.querySelectorAll("itunes\\:category")).map(
      (category) => category.getAttribute("text") ?? ""
    ),
    episodes: [],
  };

  const items = channel.querySelectorAll("item");
  podcastInfo.episodes = Array.from(items).map((item) => ({
    title: getTextContent(item, "title"),
    description: getTextContent(item, "description"),
    pubDate: getTextContent(item, "pubDate"),
    duration: getTextContent(item, "itunes\\:duration"),
    explicit: getTextContent(item, "itunes\\:explicit"),
    episode: getTextContent(item, "itunes\\:episode"),
    season: getTextContent(item, "itunes\\:season"),
    episodeType: getTextContent(item, "itunes\\:episodeType"),
    enclosure: {
      url: getAttribute(item, "enclosure", "url"),
      length: getAttribute(item, "enclosure", "length"),
      type: getAttribute(item, "enclosure", "type"),
    },
    guid: getTextContent(item, "guid"),
    link: getTextContent(item, "link"),
    image: getAttribute(item, "itunes\\:image", "href"),
  }));

  return podcastInfo;
}

export function safeParsePodcastFeed(xmlString: string): ParseResult {
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

// Usage example:
/*
  const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
  <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
    <!-- your feed content -->
  </rss>`;
  
  const result = safeParsePodcastFeed(xmlString);
  
  if (result.success && result.data) {
    // TypeScript knows result.data is PodcastFeed here
    console.log(result.data.title);
    const firstEpisode = result.data.episodes[0];
    if (firstEpisode) {
      console.log(firstEpisode.enclosure.url);
    }
  } else {
    console.error('Failed to parse feed:', result.error);
  }
  */
