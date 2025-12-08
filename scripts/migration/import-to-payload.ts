/**
 * Import exported WordPress data into PayloadCMS
 *
 * Usage:
 *   npx tsx scripts/migration/import-to-payload.ts
 *
 * Prerequisites:
 *   1. Run export-wp-data.ts first to generate JSON files
 *   2. Ensure PayloadCMS is running or DATABASE_URI is set
 */

import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'

interface ExportedAuthor {
  wpUserId: number
  name: string
  slug: string
  email: string
  gravatarUrl: string
  wpAvatarUrl: string | null
  wpAvatarAttachmentId: number | null
}

interface ExportedCategory {
  wpId: number
  name: string
  slug: string
}

interface ExportedTag {
  wpId: number
  name: string
  slug: string
}

interface ExportedMedia {
  wpId: number
  title: string
  url: string
  filename: string
  mimeType: string
  alt: string
}

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

// Maps from WordPress IDs to Payload IDs
const wpToPayloadAuthor = new Map<number, number>()
const wpToPayloadCategory = new Map<number, number>()
const wpToPayloadTag = new Map<number, number>()
const wpToPayloadMedia = new Map<number, number>()

const dataDir = './scripts/migration/data'

async function main() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  try {
    // 1. Import Authors
    console.log('\n--- Importing Authors ---')
    await importAuthors(payload)

    // 2. Import Categories
    console.log('\n--- Importing Categories ---')
    await importCategories(payload)

    // 3. Import Tags
    console.log('\n--- Importing Tags ---')
    await importTags(payload)

    // 4. Import Posts (without media relationships first)
    console.log('\n--- Importing Posts ---')
    await importPosts(payload)

    console.log('\n✓ Import complete!')
    console.log('\nNote: Media files need to be migrated separately using migrate-media.ts')
  } finally {
    // Payload cleanup
  }
}

async function importAuthors(payload: Awaited<ReturnType<typeof getPayload>>) {
  const authors: ExportedAuthor[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'authors.json'), 'utf-8')
  )

  let created = 0
  let skipped = 0

  for (const author of authors) {
    try {
      // Check if already exists by wpUserId
      const existing = await payload.find({
        collection: 'authors',
        where: { wpUserId: { equals: author.wpUserId } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        wpToPayloadAuthor.set(author.wpUserId, existing.docs[0].id as number)
        skipped++
        continue
      }

      // Check if slug exists
      const existingSlug = await payload.find({
        collection: 'authors',
        where: { slug: { equals: author.slug } },
        limit: 1,
      })

      if (existingSlug.docs.length > 0) {
        // Update with wpUserId
        await payload.update({
          collection: 'authors',
          id: existingSlug.docs[0].id,
          data: { wpUserId: author.wpUserId },
        })
        wpToPayloadAuthor.set(author.wpUserId, existingSlug.docs[0].id as number)
        skipped++
        continue
      }

      const result = await payload.create({
        collection: 'authors',
        data: {
          name: author.name,
          slug: author.slug,
          email: author.email,
          gravatarUrl: author.gravatarUrl,
          wpAvatarUrl: author.wpAvatarUrl || undefined,
          wpUserId: author.wpUserId,
        },
      })
      wpToPayloadAuthor.set(author.wpUserId, result.id as number)
      created++
    } catch (error) {
      console.error(`Failed to import author ${author.name}:`, error)
    }
  }

  console.log(`Authors: ${created} created, ${skipped} skipped`)
}

async function importCategories(payload: Awaited<ReturnType<typeof getPayload>>) {
  const categories: ExportedCategory[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'categories.json'), 'utf-8')
  )

  let created = 0
  let skipped = 0

  for (const cat of categories) {
    try {
      // Check if already exists by wpDatabaseId
      const existing = await payload.find({
        collection: 'categories',
        where: { wpDatabaseId: { equals: cat.wpId } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        wpToPayloadCategory.set(cat.wpId, existing.docs[0].id as number)
        skipped++
        continue
      }

      // Check if slug exists
      const existingSlug = await payload.find({
        collection: 'categories',
        where: { slug: { equals: cat.slug } },
        limit: 1,
      })

      if (existingSlug.docs.length > 0) {
        // Update with wpDatabaseId
        await payload.update({
          collection: 'categories',
          id: existingSlug.docs[0].id,
          data: { wpDatabaseId: cat.wpId },
        })
        wpToPayloadCategory.set(cat.wpId, existingSlug.docs[0].id as number)
        skipped++
        continue
      }

      const result = await payload.create({
        collection: 'categories',
        data: {
          name: cat.name,
          slug: cat.slug,
          wpDatabaseId: cat.wpId,
        },
      })
      wpToPayloadCategory.set(cat.wpId, result.id as number)
      created++
    } catch (error) {
      console.error(`Failed to import category ${cat.name}:`, error)
    }
  }

  console.log(`Categories: ${created} created, ${skipped} skipped`)
}

async function importTags(payload: Awaited<ReturnType<typeof getPayload>>) {
  const tags: ExportedTag[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'tags.json'), 'utf-8')
  )

  let created = 0
  let skipped = 0

  for (const tag of tags) {
    try {
      // Check if already exists by slug (tags don't have wpDatabaseId field)
      const existing = await payload.find({
        collection: 'tags',
        where: { slug: { equals: tag.slug } },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        wpToPayloadTag.set(tag.wpId, existing.docs[0].id as number)
        skipped++
        continue
      }

      const result = await payload.create({
        collection: 'tags',
        data: {
          name: tag.name,
          slug: tag.slug,
        },
      })
      wpToPayloadTag.set(tag.wpId, result.id as number)
      created++
    } catch (error) {
      console.error(`Failed to import tag ${tag.name}:`, error)
    }
  }

  console.log(`Tags: ${created} created, ${skipped} skipped`)
}

async function importPosts(payload: Awaited<ReturnType<typeof getPayload>>) {
  const posts: ExportedPost[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'posts.json'), 'utf-8')
  )

  let created = 0
  let updated = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]

    if ((i + 1) % 100 === 0) {
      console.log(`Processing post ${i + 1}/${posts.length}...`)
    }

    try {
      // Check if already exists by wpDatabaseId
      const existing = await payload.find({
        collection: 'posts',
        where: { wpDatabaseId: { equals: post.wpId } },
        limit: 1,
      })

      // Map author ID
      const authorId = wpToPayloadAuthor.get(post.authorWpId)

      // Map category and tag IDs
      const categoryIds = post.categoryWpIds
        .map((wpId) => wpToPayloadCategory.get(wpId))
        .filter((id): id is number => id !== undefined)

      const tagIds = post.tagWpIds
        .map((wpId) => wpToPayloadTag.get(wpId))
        .filter((id): id is number => id !== undefined)

      // Prepare post data
      const postData = {
        title: post.title,
        // Content will be imported as HTML in excerpt for now
        // Full Lexical conversion would require additional processing
        excerpt: post.excerpt || undefined,
        slug: post.slug,
        uri: post.uri,
        publishedAt: post.publishedAt,
        status: post.status as 'draft' | 'publish',
        author: authorId,
        categories: categoryIds,
        tags: tagIds,
        antetitulo: post.antetitulo || undefined,
        chamadaDestaque: post.chamadaDestaque || undefined,
        chamadaManchete: post.chamadaManchete || undefined,
        wpDatabaseId: post.wpId,
        // Store WordPress featured image URL for fallback
        wpFeaturedImage: post.featuredImageUrl
          ? {
              url: post.featuredImageUrl,
              alt: post.title,
            }
          : undefined,
      }

      if (existing.docs.length > 0) {
        // Update existing
        await payload.update({
          collection: 'posts',
          id: existing.docs[0].id,
          data: postData,
        })
        updated++
      } else {
        // Check for slug conflict
        const existingSlug = await payload.find({
          collection: 'posts',
          where: { slug: { equals: post.slug } },
          limit: 1,
        })

        if (existingSlug.docs.length > 0) {
          // Append wpId to make slug unique
          postData.slug = `${post.slug}-${post.wpId}`
        }

        await payload.create({
          collection: 'posts',
          data: postData,
        })
        created++
      }
    } catch (error) {
      console.error(`Failed to import post "${post.title}" (WP ID: ${post.wpId}):`, error)
      errors++
    }
  }

  console.log(`Posts: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`)
}

main().catch(console.error)
