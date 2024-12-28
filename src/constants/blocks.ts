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

export const GRID_SPANS = {
  // Column spans for tablet (2-column layout)
  tabletCol: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-2",
    4: "sm:col-span-2",
    5: "sm:col-span-2",
    6: "sm:col-span-2",
  },
  // Column spans for desktop (6-column layout)
  desktopCol: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
  },
  row: {
    1: "row-span-1",
    2: "sm:row-span-2",
    3: "sm:row-span-3",
    4: "sm:row-span-4",
    5: "sm:row-span-5",
    6: "sm:row-span-6",
  },
  // Column start positions only apply on desktop
  colStart: {
    0: "lg:col-start-1",
    1: "lg:col-start-2",
    2: "lg:col-start-3",
    3: "lg:col-start-4",
    4: "lg:col-start-5",
    5: "lg:col-start-6",
    6: "lg:col-start-7",
  },
  rowStart: {
    0: "sm:row-start-1",
    1: "sm:row-start-2",
    2: "sm:row-start-3",
    3: "sm:row-start-4",
    4: "sm:row-start-5",
    5: "sm:row-start-6",
    6: "sm:row-start-7",
  },
} as const;
