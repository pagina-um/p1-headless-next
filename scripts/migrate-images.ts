#!/usr/bin/env tsx
/**
 * WordPress Featured Images Migration Script
 *
 * This script migrates featured image URLs from WordPress to Payload CMS:
 * - Fetches posts with featured images from WordPress GraphQL API
 * - Stores the image URLs in the wpFeaturedImage field
 */

import { getPayload } from "payload";
import config from "../payload.config";

// WordPress GraphQL endpoint
const WP_URL = process.env.NEXT_PUBLIC_WP_URL;
const GRAPHQL_ENDPOINT = WP_URL ? `${WP_URL}graphql` : "";

// Migration statistics
const stats = {
  posts: { total: 0, processed: 0, skipped: 0, failed: 0 },
};

// GraphQL query to fetch a single post with featured image by ID
const GET_POST_BY_ID = `
  query GetPostById($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
    }
  }
`;

// Execute GraphQL query
async function fetchWordPressData(query: string, variables: any = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.statusText}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  return json.data;
}

// Migrate image URLs for posts in local database
async function migrateImageUrls(payload: any) {
  console.log("\n📸 Fetching posts from local Payload database...");

  // Get all posts from local Payload DB that have wpDatabaseId but no wpFeaturedImage
  const localPosts = await payload.find({
    collection: "posts",
    limit: 1000,
    where: {
      wpDatabaseId: {
        exists: true,
      },
    },
  });

  console.log(`\n📦 Found ${localPosts.docs.length} posts in local database`);
  stats.posts.total = localPosts.docs.length;

  for (const payloadPost of localPosts.docs) {
    try {
      // Skip if already has WordPress featured image data
      if (payloadPost.wpFeaturedImage?.url) {
        console.log(`  ↷ ${payloadPost.title} - Already has image URL`);
        stats.posts.skipped++;
        continue;
      }

      // Skip if no wpDatabaseId
      if (!payloadPost.wpDatabaseId) {
        console.log(`  ⊘ ${payloadPost.title} - No wpDatabaseId`);
        stats.posts.skipped++;
        continue;
      }

      // Fetch the post from WordPress to get the featured image
      console.log(`  → Fetching image for: ${payloadPost.title}`);
      const wpData = await fetchWordPressData(GET_POST_BY_ID, {
        id: payloadPost.wpDatabaseId.toString(),
      });

      const wpPost = wpData.post;

      // Skip if no featured image in WordPress
      if (!wpPost?.featuredImage?.node?.sourceUrl) {
        console.log(`  ⊘ ${payloadPost.title} - No featured image in WordPress`);
        stats.posts.skipped++;
        continue;
      }

      const imageData = wpPost.featuredImage.node;

      // Update the post with the image URL data
      await payload.update({
        collection: "posts",
        id: payloadPost.id,
        data: {
          wpFeaturedImage: {
            url: imageData.sourceUrl,
            alt: imageData.altText || payloadPost.title || "",
            width: imageData.mediaDetails?.width || 0,
            height: imageData.mediaDetails?.height || 0,
          },
        },
      });

      console.log(`  ✓ ${payloadPost.title} - ${imageData.sourceUrl}`);
      stats.posts.processed++;
    } catch (error: any) {
      console.log(`  ✗ ${payloadPost.title}: ${error.message}`);
      stats.posts.failed++;
    }
  }
}

// Main migration function
async function migrate() {
  console.log("🚀 Starting Featured Image URLs Migration\n");
  console.log("=".repeat(60));

  if (!WP_URL) {
    console.error("❌ NEXT_PUBLIC_WP_URL is not set in environment");
    console.error("Make sure to load .env.development.local");
    process.exit(1);
  }

  console.log(`WordPress URL: ${WP_URL}`);

  try {
    // Initialize Payload
    console.log("Initializing Payload CMS...");
    const payload = await getPayload({ config });
    console.log("✓ Payload initialized\n");

    // Run migration
    await migrateImageUrls(payload);

    // Print statistics
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Statistics\n");
    console.log(`Total posts fetched: ${stats.posts.total}`);
    console.log(`Posts processed:     ${stats.posts.processed} ✓`);
    console.log(`Posts skipped:       ${stats.posts.skipped} ⊘`);
    console.log(`Posts failed:        ${stats.posts.failed} ✗`);

    console.log("\n✅ Migration completed!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Migration failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run migration
migrate();
