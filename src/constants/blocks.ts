export const STATIC_BLOCKS = {
  newsletter: {
    type: "newsletter" as const,
    title: "Newsletter Subscription",
    content:
      "Stay updated with our latest news and stories delivered directly to your inbox.",
    defaultSize: { width: 3, height: 1 },
  },
  podcast: {
    type: "podcast" as const,
    title: "Latest Podcasts",
    content:
      "Listen to our latest episodes discussing current events and in-depth stories.",
    defaultSize: { width: 3, height: 2 },
    episodes: [
      {
        id: 1,
        title: "The Future of AI in Journalism",
        duration: "32:15",
        date: "2024-03-15",
        description:
          "Exploring how artificial intelligence is reshaping modern journalism.",
        audioUrl: "https://example.com/podcast-1.mp3",
      },
      {
        id: 2,
        title: "Climate Change: Local Impact",
        duration: "28:45",
        date: "2024-03-08",
        description:
          "Investigating how climate change affects our local communities.",
        audioUrl: "https://example.com/podcast-2.mp3",
      },
      {
        id: 3,
        title: "Democracy in the Digital Age",
        duration: "35:20",
        date: "2024-03-01",
        description:
          "Analyzing the challenges of maintaining democratic values in the era of social media.",
        audioUrl: "https://example.com/podcast-3.mp3",
      },
    ],
  },
  divider: {
    type: "divider" as const,
    title: "Divider",
    content: "A simple divider to separate content.",
    defaultSize: { width: 10, height: 1 },
  },
  donation: {
    type: "donation" as const,
    title: "Apoiar",
    content: "Support independent journalism by making a donation.",
    defaultSize: { width: 3, height: 4 },
  },
};

export const GRID_COLUMNS = 10;

export const ROW_HEIGHT = 48;

export const BLOCK_MIN_ROWS = 4;
