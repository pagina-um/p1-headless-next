/**
 * Migrate WordPress HTML content to Payload's Lexical rich text format
 *
 * Usage:
 *   npx tsx scripts/migration/migrate-content.ts
 *
 * Prerequisites:
 *   1. Run import-to-payload.ts first to import posts
 *   2. Ensure PayloadCMS is running or DATABASE_URI is set
 */

import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'
import { htmlToRichText } from '../../src/utils/richTextConversion'

interface ExportedPost {
  wpId: number
  title: string
  content: string
  excerpt: string
  slug: string
  publishedAt: string
  status: string
  uri: string
  authorWpId: number
  featuredImageWpId: number | null
  featuredImageUrl: string | null
  categoryWpIds: number[]
  tagWpIds: number[]
  antetitulo: string
  chamadaDestaque: string
  chamadaManchete: string
}

const dataDir = './scripts/migration/data'

async function main() {
  console.log('Loading WordPress posts data...')
  const postsData: ExportedPost[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'posts.json'), 'utf-8')
  )

  // Build wpId -> content lookup
  const wpContentMap = new Map<number, string>()
  for (const post of postsData) {
    if (post.content && post.content.trim()) {
      wpContentMap.set(post.wpId, post.content)
    }
  }
  console.log(`Loaded ${wpContentMap.size} posts with content from posts.json`)

  console.log('\nInitializing Payload...')
  const payload = await getPayload({ config })

  // Query all posts with wpDatabaseId (migrated posts)
  console.log('\nFetching posts from Payload...')
  const allPosts = await payload.find({
    collection: 'posts',
    where: {
      wpDatabaseId: { exists: true },
    },
    limit: 0, // Get all posts
    depth: 0, // Don't populate relationships
  })

  console.log(`Found ${allPosts.docs.length} migrated posts in Payload`)

  // Filter to only posts without content
  const postsNeedingContent = allPosts.docs.filter((post) => {
    // Check if content is empty/null/undefined
    if (!post.content) return true
    if (typeof post.content === 'object' && post.content.root) {
      // Lexical format - check if root has children
      const root = post.content.root as { children?: unknown[] }
      if (!root.children || root.children.length === 0) return true
    }
    return false
  })

  console.log(`${postsNeedingContent.length} posts need content migration\n`)

  if (postsNeedingContent.length === 0) {
    console.log('All posts already have content. Nothing to do.')
    process.exit(0)
  }

  let success = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < postsNeedingContent.length; i++) {
    const post = postsNeedingContent[i]
    const wpId = post.wpDatabaseId as number

    // Progress logging every 100 posts
    if ((i + 1) % 100 === 0 || i === 0) {
      console.log(`Processing ${i + 1}/${postsNeedingContent.length}...`)
    }

    // Get HTML content from WordPress export
    const htmlContent = wpContentMap.get(wpId)
    if (!htmlContent) {
      skipped++
      continue
    }

    try {
      // Convert HTML to Lexical rich text
      const richTextContent = await htmlToRichText(htmlContent)

      if (!richTextContent) {
        skipped++
        continue
      }

      // Update the post
      await payload.update({
        collection: 'posts',
        id: post.id,
        data: {
          content: richTextContent,
        },
      })

      success++
    } catch (error) {
      console.error(`Failed to migrate content for post "${post.title}" (WP ID: ${wpId}):`, error)
      errors++
    }
  }

  console.log('\n--- Migration Complete ---')
  console.log(`Success: ${success}`)
  console.log(`Skipped (no WP content): ${skipped}`)
  console.log(`Errors: ${errors}`)
}

main().catch(console.error)
