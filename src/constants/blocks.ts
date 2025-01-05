export const STATIC_BLOCKS = {
  newsletter: {
    id: "newsletter" as const,
    title: "Newsletter Subscription",
    content:
      "Stay updated with our latest news and stories delivered directly to your inbox.",
    defaultSize: { width: 3, height: 1 },
  },
  podcast: {
    id: "podcast" as const,
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
};

export const GRID_COLUMNS = 6;

export const ROW_HEIGHT = 100;

export const BLOCK_MIN_ROWS = 2;

export const GRID_SPANS = {
  col: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
    7: "lg:col-span-7",
    8: "lg:col-span-8",
    9: "lg:col-span-9",
    10: "lg:col-span-10",
    11: "lg:col-span-11",
    12: "lg:col-span-12",
  },
  row: {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
    4: "lg:row-span-4",
    5: "lg:row-span-5",
    6: "lg:row-span-6",
    7: "lg:row-span-7",
    8: "lg:row-span-8",
    9: "lg:row-span-9",
    10: "lg:row-span-10",
  },
  colStart: {
    0: "lg:col-start-1",
    1: "lg:col-start-2",
    2: "lg:col-start-3",
    3: "lg:col-start-4",
    4: "lg:col-start-5",
    5: "lg:col-start-6",
    6: "lg:col-start-7",
    7: "lg:col-start-8",
    8: "lg:col-start-9",
    9: "lg:col-start-10",
    10: "lg:col-start-11",
    11: "lg:col-start-12",
    12: "lg:col-start-13",
  },
  rowStart: {
    0: "lg:row-start-1",
    1: "lg:row-start-2",
    2: "lg:row-start-3",
    3: "lg:row-start-4",
    4: "lg:row-start-5",
    5: "lg:row-start-6",
    6: "lg:row-start-7",
    7: "lg:row-start-8",
    8: "lg:row-start-9",
    9: "lg:row-start-10",
    10: "lg:row-start-11",
    11: "lg:row-start-12",
    12: "lg:row-start-13",
  },
} as const;
