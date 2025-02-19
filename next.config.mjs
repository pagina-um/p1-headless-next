/** @type {import('next').NextConfig} */
const gqlUrl = new URL(process.env.NEXT_PUBLIC_WP_URL);
const domain = gqlUrl.hostname;

const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "www.paginaum.pt", domain],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 64, 96, 128, 256],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  async rewrites() {
    return [
      // Documents
      {
        source: "/media/:path*.pdf",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.pdf`,
      },
      {
        source: "/media/:path*.doc",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.doc`,
      },
      {
        source: "/media/:path*.docx",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.docx`,
      },
      // Spreadsheets
      {
        source: "/media/:path*.xls",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.xls`,
      },
      {
        source: "/media/:path*.xlsx",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.xlsx`,
      },
      // Presentations
      {
        source: "/media/:path*.ppt",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.ppt`,
      },
      {
        source: "/media/:path*.pptx",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.pptx`,
      },
      // Text files
      {
        source: "/media/:path*.txt",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.txt`,
      },
      // Archives
      {
        source: "/media/:path*.zip",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.zip`,
      },
      {
        source: "/media/:path*.rar",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.rar`,
      },
      // Audio
      {
        source: "/media/:path*.mp3",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.mp3`,
      },
      {
        source: "/media/:path*.wav",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.wav`,
      },
      // Video
      {
        source: "/media/:path*.mp4",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.mp4`,
      },
      {
        source: "/media/:path*.mov",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*.mov`,
      },
      // Catch-all for images and other files
      {
        source: "/media/:path*",
        destination: `${process.env.NEXT_PUBLIC_WP_URL}/wp-content/uploads/:path*`,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; object-src 'self'; media-src 'self'",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.experiments = {
        ...config.experiments,
        topLevelAwait: true,
      };
    }
    return config;
  },
};

// Handle self-signed certificates in development
if (process.env.NODE_ENV === "development") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export default nextConfig;
