/**
 * Migrate media files from WordPress to Vercel Blob
 *
 * Usage:
 *   npx tsx scripts/migration/migrate-media.ts                    # Migrate all
 *   npx tsx scripts/migration/migrate-media.ts --batch=100        # Process 100 at a time
 *   npx tsx scripts/migration/migrate-media.ts --skip=500         # Skip first 500
 *   npx tsx scripts/migration/migrate-media.ts --no-thumbnails    # Skip thumbnail generation (faster)
 *
 * Prerequisites:
 *   1. Run export-wp-data.ts first
 *   2. Set BLOB_READ_WRITE_TOKEN environment variable
 *   3. (Optional) Local WordPress backup at ~/Desktop/wp-backup/
 */

// Load environment variables BEFORE importing anything else
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.development.local' })

import fs from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'
import os from 'os'
import { put } from '@vercel/blob'
import sharp from 'sharp'

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
  featuredImageWpId: number | null
  featuredImageUrl: string | null
}

const dataDir = './scripts/migration/data'

// Local backup path - check for wp-content/uploads inside
const LOCAL_BACKUP_PATH = path.join(
  os.homedir(),
  'Desktop/wp-backup/paginaum.pt__2025-03-19T18_48_24+0000/files/wp-content/uploads'
)

// Parse CLI args
const args = process.argv.slice(2)
let batchSize = 50
let skipCount = 0
let generateThumbnails = true

for (const arg of args) {
  if (arg.startsWith('--batch=')) {
    batchSize = parseInt(arg.split('=')[1])
  }
  if (arg.startsWith('--skip=')) {
    skipCount = parseInt(arg.split('=')[1])
  }
  if (arg === '--no-thumbnails') {
    generateThumbnails = false
  }
}

/**
 * Extract the uploads path from a WordPress URL
 * e.g., "https://paginaum.pt/wp-content/uploads/2022/10/image.jpg" -> "2022/10/image.jpg"
 */
function extractUploadsPath(url: string): string | null {
  const match = url.match(/wp-content\/uploads\/(.+)$/)
  return match ? match[1] : null
}

/**
 * Try to get file from local backup, returns Buffer or null
 */
function getLocalFile(url: string): Buffer | null {
  const uploadsPath = extractUploadsPath(url)
  if (!uploadsPath) return null

  const localPath = path.join(LOCAL_BACKUP_PATH, uploadsPath)

  if (existsSync(localPath)) {
    try {
      return readFileSync(localPath)
    } catch {
      return null
    }
  }
  return null
}

/**
 * Generate image sizes using sharp
 * @param uploadsPath - The WordPress uploads path (e.g., "2022/10/image.jpg")
 */
async function generateImageSizes(buffer: Buffer, uploadsPath: string, mimeType: string) {
  const sizes: {
    thumbnail?: { url: string; width: number; height: number; filesize: number; filename: string; mimeType: string }
    card?: { url: string; width: number; height: number; filesize: number; filename: string; mimeType: string }
    featured?: { url: string; width: number; height: number; filesize: number; filename: string; mimeType: string }
  } = {}

  if (!mimeType.startsWith('image/') || mimeType === 'image/svg+xml') {
    return sizes
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN!
  const filename = uploadsPath.split('/').pop() || ''
  const dirPath = uploadsPath.substring(0, uploadsPath.lastIndexOf('/'))
  const baseName = filename.replace(/\.[^.]+$/, '')
  const ext = filename.match(/\.[^.]+$/)?.[0] || '.jpg'

  const sizeConfigs = [
    { name: 'thumbnail', width: 400, height: 300 },
    { name: 'card', width: 768, height: 512 },
    { name: 'featured', width: 1200, height: 675 },
  ]

  for (const sizeConfig of sizeConfigs) {
    try {
      const resized = await sharp(buffer)
        .resize(sizeConfig.width, sizeConfig.height, { fit: 'cover', position: 'center' })
        .toBuffer()

      const sizeFilename = `${baseName}-${sizeConfig.width}x${sizeConfig.height}${ext}`
      // Preserve date folder structure: media/2022/10/image-400x300.jpg
      const sizeBlobPath = dirPath ? `media/${dirPath}/${sizeFilename}` : `media/${sizeFilename}`
      const blob = await put(sizeBlobPath, resized, {
        access: 'public',
        token,
        contentType: mimeType,
      })

      sizes[sizeConfig.name as keyof typeof sizes] = {
        url: blob.url,
        width: sizeConfig.width,
        height: sizeConfig.height,
        filesize: resized.length,
        filename: sizeFilename,
        mimeType,
      }
    } catch (error) {
      console.log(`    Warning: Could not generate ${sizeConfig.name} size`)
    }
  }

  return sizes
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is required')
    console.error('Set it in your shell: export BLOB_READ_WRITE_TOKEN="your_token"')
    process.exit(1)
  }

  console.log('BLOB_READ_WRITE_TOKEN is set:', token.substring(0, 20) + '...')

  // Check if local backup exists
  const hasLocalBackup = existsSync(LOCAL_BACKUP_PATH)
  console.log(`Local backup: ${hasLocalBackup ? '✓ Found at ' + LOCAL_BACKUP_PATH : '✗ Not found (will download all)'}`)

  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  // Load exported data
  const media: ExportedMedia[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'media.json'), 'utf-8')
  )
  const posts: ExportedPost[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'posts.json'), 'utf-8')
  )

  // Get media IDs that are actually used as featured images
  const usedMediaIds = new Set(
    posts.map((p) => p.featuredImageWpId).filter((id): id is number => id !== null)
  )

  // Filter to only used media (prioritize featured images)
  const priorityMedia = media.filter((m) => usedMediaIds.has(m.wpId))
  const otherMedia = media.filter((m) => !usedMediaIds.has(m.wpId))

  console.log(`Total media: ${media.length}`)
  console.log(`Featured images (priority): ${priorityMedia.length}`)
  console.log(`Other media: ${otherMedia.length}`)

  // Process priority media first, then others
  const allMedia = [...priorityMedia, ...otherMedia]
  const toProcess = allMedia.slice(skipCount, skipCount + batchSize)

  console.log(`\nProcessing ${toProcess.length} items (skip: ${skipCount}, batch: ${batchSize})`)

  let success = 0
  let failed = 0
  let skipped = 0
  let skippedInvalid = 0
  let fromLocal = 0
  let fromRemote = 0

  // Track WP ID to Payload ID mapping
  const mediaMapping: Record<number, number> = {}

  // Load existing mapping if available
  const mappingFile = path.join(dataDir, 'media-mapping.json')
  try {
    const existing = JSON.parse(await fs.readFile(mappingFile, 'utf-8'))
    Object.assign(mediaMapping, existing)
    console.log(`Loaded ${Object.keys(existing).length} existing mappings`)
  } catch {
    // No existing mapping
  }

  for (let i = 0; i < toProcess.length; i++) {
    const item = toProcess[i]
    const progress = `[${i + 1}/${toProcess.length}]`

    // Skip if already migrated
    if (mediaMapping[item.wpId]) {
      console.log(`${progress} Skipping ${item.filename} (already migrated)`)
      skipped++
      continue
    }

    // Skip invalid URLs (no wp-content/uploads path)
    if (!item.url.includes('wp-content/uploads')) {
      console.log(`${progress} Skipping ${item.filename} (invalid URL)`)
      skippedInvalid++
      continue
    }

    try {
      let buffer: Buffer | null = null
      let source = 'remote'

      // Try local backup first
      if (hasLocalBackup) {
        buffer = getLocalFile(item.url)
        if (buffer) {
          source = 'local'
          fromLocal++
        }
      }

      // Fall back to download
      if (!buffer) {
        console.log(`${progress} Downloading ${item.filename}...`)
        const response = await fetch(item.url)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        const arrayBuffer = await response.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
        fromRemote++
      } else {
        console.log(`${progress} Using local file ${item.filename}`)
      }

      console.log(`${progress} Uploading to Vercel Blob...`)

      // Extract WordPress uploads path (e.g., "2022/10/image.jpg")
      const uploadsPath = extractUploadsPath(item.url) || item.filename

      // Upload main file directly to Vercel Blob with date folder structure
      const blob = await put(`media/${uploadsPath}`, buffer, {
        access: 'public',
        token,
        contentType: item.mimeType,
      })

      // Get image dimensions if it's an image
      let width: number | undefined
      let height: number | undefined
      if (item.mimeType.startsWith('image/') && item.mimeType !== 'image/svg+xml') {
        try {
          const metadata = await sharp(buffer).metadata()
          width = metadata.width
          height = metadata.height
        } catch {
          // Ignore dimension errors
        }
      }

      // Generate image sizes (with date folder structure)
      const sizes = await generateImageSizes(buffer, uploadsPath, item.mimeType)

      // Create media document in Payload with the Vercel Blob URL
      const result = await payload.create({
        collection: 'media',
        data: {
          alt: item.alt || item.title || item.filename,
          url: blob.url,
          filename: item.filename,
          mimeType: item.mimeType,
          filesize: buffer.length,
          width,
          height,
          sizes,
        },
      })

      mediaMapping[item.wpId] = result.id as number
      success++
      console.log(`${progress} ✓ Uploaded ${item.filename} -> ID ${result.id} (${source})`)
    } catch (error) {
      console.error(`${progress} ✗ Failed ${item.filename}:`, error)
      failed++
    }

    // Save mapping periodically
    if ((i + 1) % 10 === 0) {
      await fs.writeFile(mappingFile, JSON.stringify(mediaMapping, null, 2))
    }
  }

  // Final save
  await fs.writeFile(mappingFile, JSON.stringify(mediaMapping, null, 2))

  console.log(`\n--- Summary ---`)
  console.log(`Success: ${success}`)
  console.log(`  From local backup: ${fromLocal}`)
  console.log(`  From remote download: ${fromRemote}`)
  console.log(`Failed: ${failed}`)
  console.log(`Skipped (already migrated): ${skipped}`)
  console.log(`Skipped (invalid URL): ${skippedInvalid}`)
  console.log(`\nMapping saved to: ${mappingFile}`)

  if (skipCount + batchSize < allMedia.length) {
    console.log(`\nTo continue, run:`)
    console.log(`npx tsx scripts/migration/migrate-media.ts --skip=${skipCount + batchSize} --batch=${batchSize}`)
  }
}

main().catch(console.error)
