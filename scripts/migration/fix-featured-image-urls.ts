/**
 * Fix Featured Image URLs
 *
 * This script fixes posts that have broken `?attachment_id=X` URLs
 * by looking up the correct URL from media.json
 *
 * Usage:
 *   npx tsx scripts/migration/fix-featured-image-urls.ts
 *   npx tsx scripts/migration/fix-featured-image-urls.ts --dry-run
 */

import { execSync } from 'child_process'
import fs from 'fs/promises'
import path from 'path'

interface MediaItem {
  wpId: number
  title: string
  url: string
  filename: string
  mimeType: string
  alt: string
}

const DB_PATH = path.join(process.cwd(), 'payload.db')
const MEDIA_JSON_PATH = path.join(process.cwd(), 'scripts/migration/data/media.json')

function runSql(sql: string): string {
  return execSync(`sqlite3 "${DB_PATH}" "${sql}"`, { encoding: 'utf-8' })
}

async function main() {
  const dryRun = process.argv.includes('--dry-run')

  if (dryRun) {
    console.log('DRY RUN MODE - No changes will be made\n')
  }

  // Load media.json
  console.log('Loading media.json...')
  const mediaData = await fs.readFile(MEDIA_JSON_PATH, 'utf-8')
  const media: MediaItem[] = JSON.parse(mediaData)

  // Create wpId -> url map
  const mediaMap = new Map<number, string>()
  for (const item of media) {
    mediaMap.set(item.wpId, item.url)
  }
  console.log(`Loaded ${mediaMap.size} media items\n`)

  // Find posts with broken URLs
  const brokenPostsRaw = runSql(
    `SELECT id, title, wp_featured_image_url FROM posts WHERE wp_featured_image_url LIKE '%?attachment_id=%';`
  )

  const brokenPosts = brokenPostsRaw
    .trim()
    .split('\n')
    .filter((line) => line)
    .map((line) => {
      const parts = line.split('|')
      return {
        id: parseInt(parts[0], 10),
        title: parts[1],
        wp_featured_image_url: parts[2],
      }
    })

  console.log(`Found ${brokenPosts.length} posts with broken ?attachment_id= URLs\n`)

  if (brokenPosts.length === 0) {
    console.log('No posts to fix!')
    return
  }

  let fixed = 0
  let notFound = 0
  const notFoundIds: number[] = []

  for (const post of brokenPosts) {
    // Extract attachment ID from URL
    const match = post.wp_featured_image_url.match(/[?&]attachment_id=(\d+)/)
    if (!match) {
      console.log(`Could not parse attachment_id from: ${post.wp_featured_image_url}`)
      continue
    }

    const attachmentId = parseInt(match[1], 10)
    const correctUrl = mediaMap.get(attachmentId)

    if (correctUrl) {
      if (dryRun) {
        console.log(`Would fix post ${post.id}: "${post.title.slice(0, 50)}..."`)
        console.log(`  From: ${post.wp_featured_image_url}`)
        console.log(`  To:   ${correctUrl}\n`)
      } else {
        // Escape single quotes in URL
        const escapedUrl = correctUrl.replace(/'/g, "''")
        runSql(`UPDATE posts SET wp_featured_image_url = '${escapedUrl}' WHERE id = ${post.id};`)
      }
      fixed++
    } else {
      notFound++
      notFoundIds.push(attachmentId)
    }
  }

  // Summary
  console.log('\n--- Summary ---')
  if (dryRun) {
    console.log(`Would fix: ${fixed} posts`)
  } else {
    console.log(`Fixed: ${fixed} posts`)
  }

  if (notFound > 0) {
    console.log(`Not found in media.json: ${notFound} posts`)
    const uniqueIds = [...new Set(notFoundIds)]
    console.log(
      `  Missing attachment IDs: ${uniqueIds.slice(0, 10).join(', ')}${uniqueIds.length > 10 ? '...' : ''}`
    )
  }

  console.log('\nDone!')
}

main().catch(console.error)
