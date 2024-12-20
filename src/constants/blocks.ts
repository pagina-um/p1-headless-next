export const STATIC_BLOCKS = {
  newsletter: {
    id: "newsletter",
    title: "Newsletter Subscription",
    content:
      "Stay updated with our latest news and stories delivered directly to your inbox.",
    defaultSize: { width: 3, height: 1 },
  },
  podcast: {
    id: "podcast",
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

// Update default sizes for the 6-column grid
export const BLOCK_DEFAULT_SIZES = {
  story: { width: 2, height: 1 }, // Default story takes 2 columns
  category: { width: 3, height: 2 }, // Category blocks take half the grid width
  newsletter: { width: 3, height: 1 }, // Newsletter takes half width, single height
  podcast: { width: 3, height: 2 }, // Podcast takes half width, double height
} as const;
