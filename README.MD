# Página UM - Headless Wordpress App with NextJS

A modern blog application built with Next.js 14+, using WordPress as a headless CMS. It features a landing page, article pages (both statically generated) and an admin panel. The admin panel edits and saves a grid state to Redis and the landing page uses it to display the news stories/articles.

## Features

- **Landing Page**: Dynamically displays news stories/articles based on a customizable grid layout
- **Article Pages**: Statically generated for optimal performance
- **Admin Panel**: Easy-to-use interface for managing content and layout
- **WordPress Integration**: Uses WordPress as a headless CMS for content management
- **Redis Integration**: Stores and retrieves layout configuration data

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
