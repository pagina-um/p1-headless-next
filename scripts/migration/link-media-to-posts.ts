/**
 * Link migrated media to posts
 *
 * Usage:
 *   npx tsx scripts/migration/link-media-to-posts.ts
 *
 * Prerequisites:
 *   1. Run import-to-payload.ts first (to create posts)
 *   2. Run migrate-media.ts first (to upload media and create mapping)
 */

import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'

interface ExportedPost {
  wpId: number
  featuredImageWpId: number | null
}

const dataDir = './scripts/migration/data'

async function main() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  // Load posts data
  const posts: ExportedPost[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'posts.json'), 'utf-8')
  )

  // Load media mapping
  const mappingFile = path.join(dataDir, 'media-mapping.json')
  let mediaMapping: Record<number, number> = {}
  try {
    mediaMapping = JSON.parse(await fs.readFile(mappingFile, 'utf-8'))
    console.log(`Loaded ${Object.keys(mediaMapping).length} media mappings`)
  } catch {
    console.error('Error: media-mapping.json not found. Run migrate-media.ts first.')
    process.exit(1)
  }

  console.log(`\nLinking featured images to ${posts.length} posts...`)

  let linked = 0
  let skipped = 0
  let notFound = 0
  let errors = 0

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i]

    if ((i + 1) % 100 === 0) {
      console.log(`Processing ${i + 1}/${posts.length}...`)
    }

    if (!post.featuredImageWpId) {
      skipped++
      continue
    }

    const mediaId = mediaMapping[post.featuredImageWpId]
    if (!mediaId) {
      notFound++
      continue
    }

    try {
      // Find the post by wpDatabaseId
      const existingPost = await payload.find({
        collection: 'posts',
        where: { wpDatabaseId: { equals: post.wpId } },
        limit: 1,
      })

      if (existingPost.docs.length === 0) {
        notFound++
        continue
      }

      const payloadPost = existingPost.docs[0]

      // Skip if already has featuredImage linked
      if (payloadPost.featuredImage) {
        skipped++
        continue
      }

      // Update post with featuredImage
      await payload.update({
        collection: 'posts',
        id: payloadPost.id,
        data: {
          featuredImage: mediaId,
        },
      })

      linked++
    } catch (error) {
      console.error(`Failed to link media for post WP ID ${post.wpId}:`, error)
      errors++
    }
  }

  console.log(`\n--- Summary ---`)
  console.log(`Linked: ${linked}`)
  console.log(`Skipped (no image or already linked): ${skipped}`)
  console.log(`Not found (post or media missing): ${notFound}`)
  console.log(`Errors: ${errors}`)
}

main().catch(console.error)
