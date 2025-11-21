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

import payload from 'payload'
import config from '../payload.config'
import { getClient } from '../src/services/wp-graphql'
import {
  GET_CATEGORIES,
  GET_LATEST_POSTS,
  GET_POST_BY_ID
} from '../src/services/wp-graphql'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

// Migration statistics
const stats = {
  categories: { success: 0, failed: 0, errors: [] as any[] },
  tags: { success: 0, failed: 0, errors: [] as any[] },
  media: { success: 0, failed: 0, errors: [] as any[] },
  posts: { success: 0, failed: 0, errors: [] as any[] },
}

// Download a file from URL
async function downloadFile(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(filepath)

    protocol.get(url, (response) => {
      response.pipe(file)
      file.on('finish', () => {
        file.close()
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {})
      reject(err)
    })
  })
}

// Migrate categories
async function migrateCategories() {
  console.log('\n📁 Migrating Categories...')

  try {
    const client = getClient()
    const result = await client.query(GET_CATEGORIES, {})

    if (!result.data?.categories?.nodes) {
      console.log('⚠️  No categories found')
      return
    }

    for (const wpCategory of result.data.categories.nodes) {
      try {
        await payload.create({
          collection: 'categories',
          data: {
            name: wpCategory.name,
            slug: wpCategory.slug,
            wpDatabaseId: wpCategory.databaseId,
          },
        })

        stats.categories.success++
        console.log(`  ✓ ${wpCategory.name}`)
      } catch (error: any) {
        stats.categories.failed++
        stats.categories.errors.push({
          category: wpCategory.name,
          error: error.message,
        })
        console.log(`  ✗ ${wpCategory.name}: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch categories: ${error.message}`)
  }
}

// Migrate posts
async function migratePosts(limit = 100) {
  console.log(`\n📝 Migrating Posts (limit: ${limit})...`)

  try {
    const client = getClient()
    const result = await client.query(GET_LATEST_POSTS, {})

    if (!result.data?.posts?.nodes) {
      console.log('⚠️  No posts found')
      return
    }

    // Only process the first 'limit' posts
    const postsToMigrate = result.data.posts.nodes.slice(0, limit)

    for (const wpPost of postsToMigrate) {
      try {
        // Fetch full post details using databaseId
        const fullPostResult = await client.query(GET_POST_BY_ID, { id: wpPost.databaseId.toString() })
        const fullPost = fullPostResult.data?.post

        if (!fullPost) {
          console.log(`  ⚠️  Could not fetch details for: ${wpPost.title}`)
          continue
        }

        // Find category IDs in Payload
        const categoryIds = []
        if (fullPost.categories?.nodes) {
          for (const wpCat of fullPost.categories.nodes) {
            const payloadCat = await payload.find({
              collection: 'categories',
              where: {
                name: {
                  equals: wpCat.name,
                },
              },
              limit: 1,
            })

            if (payloadCat.docs[0]) {
              categoryIds.push(payloadCat.docs[0].id)
            }
          }
        }

        // Create post (skip content for now - will need HTML to Lexical conversion)
        await payload.create({
          collection: 'posts',
          data: {
            title: fullPost.title,
            // content: will be migrated separately with HTML to Lexical conversion
            excerpt: fullPost.excerpt || '',
            slug: fullPost.slug,
            uri: fullPost.uri,
            publishedAt: fullPost.date,
            status: 'publish',
            author: {
              name: fullPost.author?.node?.name || 'Unknown',
            },
            categories: categoryIds,
            // Custom WordPress fields
            antetitulo: fullPost.postFields?.antetitulo || '',
            chamadaDestaque: fullPost.postFields?.chamadaDestaque || '',
            chamadaManchete: fullPost.postFields?.chamadaManchete || '',
            wpDatabaseId: wpPost.databaseId,
          },
        })

        stats.posts.success++
        console.log(`  ✓ ${wpPost.title}`)
      } catch (error: any) {
        stats.posts.failed++
        stats.posts.errors.push({
          post: wpPost.title,
          error: error.message,
        })
        console.log(`  ✗ ${wpPost.title}: ${error.message}`)
      }
    }
  } catch (error: any) {
    console.error(`❌ Failed to fetch posts: ${error.message}`)
  }
}

// Main migration function
async function migrate() {
  console.log('🚀 Starting WordPress to Payload CMS Migration\n')
  console.log('=' .repeat(60))

  try {
    // Initialize Payload
    console.log('Initializing Payload CMS...')
    await payload.init({
      secret: process.env.PAYLOAD_SECRET!,
      config,
    })
    console.log('✓ Payload initialized\n')

    // Run migrations
    await migrateCategories()
    await migratePosts(10) // Start with 10 posts for testing

    // Print statistics
    console.log('\n' + '='.repeat(60))
    console.log('📊 Migration Statistics\n')
    console.log(`Categories: ${stats.categories.success} ✓  ${stats.categories.failed} ✗`)
    console.log(`Tags:       ${stats.tags.success} ✓  ${stats.tags.failed} ✗`)
    console.log(`Media:      ${stats.media.success} ✓  ${stats.media.failed} ✗`)
    console.log(`Posts:      ${stats.posts.success} ✓  ${stats.posts.failed} ✗`)

    if (stats.categories.errors.length > 0 ||
        stats.posts.errors.length > 0) {
      console.log('\n⚠️  Errors occurred during migration:')

      if (stats.categories.errors.length > 0) {
        console.log('\nCategories:')
        stats.categories.errors.forEach(e =>
          console.log(`  - ${e.category}: ${e.error}`)
        )
      }

      if (stats.posts.errors.length > 0) {
        console.log('\nPosts:')
        stats.posts.errors.slice(0, 10).forEach(e =>
          console.log(`  - ${e.post}: ${e.error}`)
        )
        if (stats.posts.errors.length > 10) {
          console.log(`  ... and ${stats.posts.errors.length - 10} more`)
        }
      }
    }

    console.log('\n✅ Migration completed!')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Run migration
migrate()
