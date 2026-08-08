# Página UM - Headless Wordpress App with NextJS

A modern blog application built with Next.js 14+, using WordPress as a headless CMS. It features a landing page, article pages (both statically generated) and an admin panel. The admin panel edits and saves a grid state to Redis and the landing page uses it to display the news stories/articles.

## Features

- **Landing Page**: Dynamically displays news stories/articles based on a customizable grid layout
- **Article Pages**: Statically generated for optimal performance
- **Admin Panel**: Easy-to-use interface for managing content and layout
- **WordPress Integration**: Uses WordPress as a headless CMS for content management
- **Redis Integration**: Stores and retrieves layout configuration data
- **X Promotion**: Drafts and publishes promotional posts for published stories (see below)

## Prerequisites

- Node.js 20.x.x or newer
- npm or yarn package manager
- A WordPress instance (local or remote)
- A Redis instance (local or cloud-based)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/pagina-um/p1-headless-next.git
   cd p1-headless-next
   ```

2. **Set up environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   ```
   
   Then edit the `.env` file and add your configuration:
   - Set up your Redis instance
     - You can use Redis Cloud for free tier hosting
     - Alternatively, run Redis locally using Docker: `docker run -p 6379:6379 redis`
   - Get your Redis connection string
   - Update the corresponding variables in the `.env` file:
     ```
     PORT=3000
     REDIS_URL=your-redis-connection-string
     ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Run the portable WordPress app**
   ```bash
   npm run dev:wp
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Visit your application**
   - Frontend: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin`

## Project Structure

```
/
├── app/            # Next.js app router components
├── components/     # Reusable UI components
├── lib/            # Utility functions and API clients
├── public/         # Static assets
└── types/          # TypeScript type definitions
```

## Environment Variables

The following environment variables are required:

- `PORT`: The port the server will run on
- `REDIS_URL`: Your Redis connection string

## X Promotion (`/admin/x`)

Lists the latest published stories; opening one drafts a promotional post with
AI, lets the editor pick a picture from the article and edit the text under a
hard character limit, and publishes to the newspaper's X account.

The post format follows what performs on X: the main post carries the news and
the picture but **no link** (X suppresses the reach of posts with outbound
links), and the article URL goes out in a first reply instead. No hashtags, no
mentions, 240 characters maximum.

Required environment variables:

- `X_API_KEY`, `X_API_SECRET` — the X developer app's consumer keys
- `X_ACCESS_TOKEN`, `X_ACCESS_SECRET` — access tokens for the account that posts
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway; set automatically on Vercel by the
  AI Gateway integration, needed explicitly only for local development
- `AI_MODEL` — optional, defaults to `anthropic/claude-sonnet-4.6`

The X app must have **Read and Write** permissions, and the access token has to
be generated *after* that permission is set — a token minted while the app was
read-only keeps failing with a 403 on publish.

## Data Storage

This application uses Redis for data persistence. All data is stored in Redis as JSON strings, providing:
- Fast read/write operations
- Simple data structure
- Reliable data persistence
- Expiration and TTL capabilities

## Contributing

We welcome contributions from the community! Please check out [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project. We use an open source, fork-based model.

## License

This project is licensed under the [MIT License](LICENSE).
