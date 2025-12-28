#!/usr/bin/env tsx
/**
 * WordPress to Payload CMS Migration Script
 *
 * This script migrates content from WordPress to Payload CMS:
 * - Categories
 * - Tags
 * - Posts (with custom fields)
 * - Media files
 */

import payload from "payload";
import config from "../payload.config";
import { getClient } from "../src/services/wp-graphql";
import {
  GET_CATEGORIES,
  GET_LATEST_POSTS,
  GET_POST_BY_ID,
} from "../src/services/wp-graphql";
import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { htmlToRichText } from "../src/utils/richTextConversion";

async function executeQuery(
  label: string,
  client: any,
  query: any,
  variables: Record<string, any>
) {
  console.log(
    `[WP] → ${label}`,
    Object.keys(variables).length ? variables : "(no variables)"
  );
  try {
    const result = await client.query(query, variables);
    if (result.error) {
      console.error(`[WP] ← ${label} error:`, result.error);
    } else {
      const keys = Object.keys(result.data || {});
      console.log(
        `[WP] ← ${label} success. data keys: ${keys.length ? keys.join(", ") : "none"}`
      );
    }
    return result;
  } catch (error: any) {
    console.error(`[WP] ← ${label} threw an exception:`, error.message);
    throw error;
  }
}

// Migration statistics
const stats = {
  categories: { success: 0, failed: 0, errors: [] as any[] },
  tags: { success: 0, failed: 0, errors: [] as any[] },
  media: { success: 0, failed: 0, errors: [] as any[] },
  posts: { success: 0, failed: 0, errors: [] as any[] },
};

function toSlug(input: string | null | undefined, fallback: string) {
  const base = input?.trim().length ? input : fallback;

  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const DEBUG_RICH_TEXT = process.env.DEBUG_RICH_TEXT === "true";
let loggedRichTextSample = false;

// Download a file from URL
async function downloadFile(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(filepath);

    protocol
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(filepath, () => {});
        reject(err);
      });
  });
}

// Migrate categories
async function migrateCategories() {
  console.log("\n📁 Migrating Categories...");

  try {
    const client = getClient();
    const result = await executeQuery(
      "GET_CATEGORIES",
      client,
      GET_CATEGORIES,
      {}
    );
    const nodes = result.data?.categories?.nodes || [];
    console.log(`   • Categories fetched from WP: ${nodes.length}`);

    if (!nodes.length) {
      console.log("⚠️  No categories found");
      return;
    }

    for (const wpCategory of nodes) {
      try {
        const slug = toSlug(
          wpCategory.slug,
          `category-${wpCategory.databaseId}`
        );
        const existingCategory = await payload.find({
          collection: "categories",
          where: {
            or: [
              {
                wpDatabaseId: {
                  equals: wpCategory.databaseId,
                },
              },
              {
                slug: {
                  equals: slug,
                },
              },
            ],
          },
          limit: 1,
        });

        const categoryData = {
          name: wpCategory.name,
          slug,
          wpDatabaseId: wpCategory.databaseId,
        };

        if (existingCategory.docs[0]) {
          await payload.update({
            collection: "categories",
            id: existingCategory.docs[0].id,
            data: categoryData,
          });
          console.log(`  ↺ Updated ${wpCategory.name}`);
        } else {
          await payload.create({
            collection: "categories",
            data: categoryData,
          });
          console.log(`  ✓ ${wpCategory.name}`);
        }

        stats.categories.success++;
      } catch (error: any) {
        stats.categories.failed++;
        stats.categories.errors.push({
          category: wpCategory.name,
          error: error.message,
        });
        console.log(`  ✗ ${wpCategory.name}: ${error.message}`);
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch categories: ${error.message}`);
  }
}

// Migrate posts
async function migratePosts(limit = 100) {
  console.log(`\n📝 Migrating Posts (limit: ${limit})...`);

  try {
    const client = getClient();
    const result = await executeQuery(
      "GET_LATEST_POSTS",
      client,
      GET_LATEST_POSTS,
      {}
    );
    const nodes = result.data?.posts?.nodes || [];
    console.log(`   • Posts fetched from WP: ${nodes.length}`);

    if (!nodes.length) {
      console.log("⚠️  No posts found");
      return;
    }

    // Only process the first 'limit' posts
    const postsToMigrate = nodes.slice(0, limit);

    for (const wpPost of postsToMigrate) {
      try {
        // Fetch full post details using databaseId
        console.log(
          `  → Fetching full post ${wpPost.databaseId} (${wpPost.slug})`
        );
        const fullPostResult = await executeQuery(
          "GET_POST_BY_ID",
          client,
          GET_POST_BY_ID,
          { id: wpPost.databaseId.toString() }
        );
        const fullPost = fullPostResult.data?.post as any;

        if (!fullPost) {
          console.log(`  ⚠️  Could not fetch details for: ${wpPost.title}`);
          continue;
        }

        if (!fullPost.content) {
          console.log("    ⚠️  No HTML content returned from WP for this post");
        }

        const contentRichText = await htmlToRichText(fullPost.content || "");
        if (contentRichText) {
          console.log("    ✓ Converted HTML to Lexical JSON");
          if (DEBUG_RICH_TEXT && !loggedRichTextSample) {
            console.dir(contentRichText, { depth: null });
            loggedRichTextSample = true;
          }
        } else {
          console.log(
            "    ⚠️  Conversion returned null — post content will be empty"
          );
        }

        // Find category IDs in Payload
        const categoryIds = [] as string[];
        if (fullPost.categories?.nodes) {
          for (const wpCat of fullPost.categories.nodes) {
            const payloadCat = await payload.find({
              collection: "categories",
              where: {
                wpDatabaseId: {
                  equals: wpCat.databaseId,
                },
              },
              limit: 1,
            });

            if (payloadCat.docs[0]) {
              categoryIds.push(String(payloadCat.docs[0].id));
            }
          }
        }

        const slug = toSlug(fullPost.slug, `post-${fullPost.databaseId}`);
        const existingPost = await payload.find({
          collection: "posts",
          where: {
            or: [
              {
                wpDatabaseId: {
                  equals: wpPost.databaseId,
                },
              },
              {
                slug: {
                  equals: slug,
                },
              },
            ],
          },
          limit: 1,
        });

        const postData = {
          title: fullPost.title,
          content: contentRichText || undefined,
          excerpt: fullPost.excerpt || "",
          slug,
          uri: fullPost.uri,
          publishedAt: fullPost.date,
          status: fullPost.status === "publish" ? "publish" : "draft",
          author: {
            name: fullPost.author?.node?.name || "Unknown",
          },
          categories: categoryIds,
          antetitulo: fullPost.postFields?.antetitulo || "",
          chamadaDestaque: fullPost.postFields?.chamadaDestaque || "",
          chamadaManchete: fullPost.postFields?.chamadaManchete || "",
          wpDatabaseId: wpPost.databaseId,
        };

        if (existingPost.docs[0]) {
          await payload.update({
            collection: "posts",
            id: existingPost.docs[0].id,
            data: postData,
          });
          console.log(`  ↺ Updated ${wpPost.title}`);
        } else {
          await payload.create({
            collection: "posts",
            data: postData,
          });
          console.log(`  ✓ ${wpPost.title}`);
        }

        stats.posts.success++;
      } catch (error: any) {
        stats.posts.failed++;
        stats.posts.errors.push({
          post: wpPost.title,
          error: error.message,
        });
        console.log(`  ✗ ${wpPost.title}: ${error.message}`);
        const errorDetails = error?.data?.errors || error?.errors;
        if (errorDetails) {
          console.dir(errorDetails, { depth: null });
        }
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch posts: ${error.message}`);
  }
}

// Main migration function
async function migrate() {
  console.log("🚀 Starting WordPress to Payload CMS Migration\n");
  console.log("=".repeat(60));

  try {
    // Initialize Payload
    console.log("Initializing Payload CMS...");
    await payload.init({
      secret: process.env.PAYLOAD_SECRET!,
      config,
    } as any);
    console.log("✓ Payload initialized\n");

    // Run migrations
    await migrateCategories();
    await migratePosts(10); // Start with 10 posts for testing

    // Print statistics
    console.log("\n" + "=".repeat(60));
    console.log("📊 Migration Statistics\n");
    console.log(
      `Categories: ${stats.categories.success} ✓  ${stats.categories.failed} ✗`
    );
    console.log(`Tags:       ${stats.tags.success} ✓  ${stats.tags.failed} ✗`);
    console.log(
      `Media:      ${stats.media.success} ✓  ${stats.media.failed} ✗`
    );
    console.log(
      `Posts:      ${stats.posts.success} ✓  ${stats.posts.failed} ✗`
    );

    if (stats.categories.errors.length > 0 || stats.posts.errors.length > 0) {
      console.log("\n⚠️  Errors occurred during migration:");

      if (stats.categories.errors.length > 0) {
        console.log("\nCategories:");
        stats.categories.errors.forEach((e) =>
          console.log(`  - ${e.category}: ${e.error}`)
        );
      }

      if (stats.posts.errors.length > 0) {
        console.log("\nPosts:");
        stats.posts.errors
          .slice(0, 10)
          .forEach((e) => console.log(`  - ${e.post}: ${e.error}`));
        if (stats.posts.errors.length > 10) {
          console.log(`  ... and ${stats.posts.errors.length - 10} more`);
        }
      }
    }

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
