# Página UM - Headless Wordpress App with NextJS

A modern blog application built with Next.js 14+, using WordPress as a headless CMS. It features a landing page, article pages (both statically generated) and an admin panel. The admin panel edits and saves a grid state to JSONbin and the landing page uses it to display the news stories/articles.

## Prerequisites

- Node.js 16.8.0 or newer
- npm or yarn package manager
- A WordPress instance with GraphQL enabled

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install

```

3. Configure environment variables by creating a `.env.local` file

```
ADMIN_PASSWORD=your_admin_password
NEXT_PUBLIC_GQL_URL=your_wordpress_graphql_url
```

4. (Optional) Run a local instance of Wordpress with WPGraphQL plugin

5. Run the development server

```bash
npm run dev
# or
yarn dev

```
