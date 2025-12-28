/**
 * Import media records into PayloadCMS after bulk upload
 *
 * This script reads media.json and creates PayloadCMS records
 * with URLs pointing to already-uploaded Vercel Blob files.
 *
 * Usage:
 *   npx tsx scripts/migration/import-media-records.ts
 *   npx tsx scripts/migration/import-media-records.ts --batch=1000
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.development.local' })

import fs from 'fs/promises'
import path from 'path'
import { getPayload } from 'payload'
import config from '../../payload.config'

interface ExportedMedia {
  wpId: number
  title: string
  url: string
  filename: string
  mimeType: string
  alt: string
}

const dataDir = './scripts/migration/data'

// The base URL for uploaded files - get from blob-urls.json first entry
let BLOB_BASE_URL = ''

// Parse CLI args
const args = process.argv.slice(2)
let batchSize = 500

for (const arg of args) {
  if (arg.startsWith('--batch=')) {
    batchSize = parseInt(arg.split('=')[1])
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
 * Transform WordPress URL to Vercel Blob URL
 */
function transformUrl(wpUrl: string): string | null {
  const uploadsPath = extractUploadsPath(wpUrl)
  if (!uploadsPath) return null
  return `${BLOB_BASE_URL}/media/${uploadsPath}`
}

async function main() {
  console.log('Initializing Payload...')
  const payload = await getPayload({ config })

  // Load blob URLs mapping to get the base URL
  const blobUrlsFile = path.join(dataDir, 'blob-urls.json')
  let blobUrls: Record<string, string> = {}

  try {
    blobUrls = JSON.parse(await fs.readFile(blobUrlsFile, 'utf-8'))
    console.log(`Loaded ${Object.keys(blobUrls).length} blob URLs`)

    // Extract base URL from first entry
    const firstUrl = Object.values(blobUrls)[0]
    if (firstUrl) {
      // Extract: https://xxx.public.blob.vercel-storage.com from full URL
      const match = firstUrl.match(/(https:\/\/[^/]+)/)
      if (match) {
        BLOB_BASE_URL = match[1]
        console.log(`Blob base URL: ${BLOB_BASE_URL}`)
      }
    }
  } catch (error) {
    console.error('Error: Run bulk-upload-media.ts first to upload files')
    console.error('Missing blob-urls.json')
    process.exit(1)
  }

  if (!BLOB_BASE_URL) {
    console.error('Error: Could not determine blob base URL')
    process.exit(1)
  }

  // Load media.json
  const media: ExportedMedia[] = JSON.parse(
    await fs.readFile(path.join(dataDir, 'media.json'), 'utf-8')
  )
  console.log(`Loaded ${media.length} media entries from media.json`)

  // Load existing mapping
  const mappingFile = path.join(dataDir, 'media-mapping.json')
  const mediaMapping: Record<number, number> = {}

  try {
    const existing = JSON.parse(await fs.readFile(mappingFile, 'utf-8'))
    Object.assign(mediaMapping, existing)
    console.log(`Loaded ${Object.keys(existing).length} existing mappings`)
  } catch {
    // No existing mapping
  }

  let created = 0
  let skipped = 0
  let failed = 0
  let notUploaded = 0

  for (let i = 0; i < media.length; i++) {
    const item = media[i]

    if ((i + 1) % 100 === 0) {
      console.log(`Processing ${i + 1}/${media.length}...`)
    }

    // Skip if already migrated
    if (mediaMapping[item.wpId]) {
      skipped++
      continue
    }

    // Transform URL
    const uploadsPath = extractUploadsPath(item.url)
    if (!uploadsPath) {
      failed++
      continue
    }

    // Check if file was uploaded
    if (!blobUrls[uploadsPath]) {
      notUploaded++
      continue
    }

    const blobUrl = blobUrls[uploadsPath]

    try {
      const result = await payload.create({
        collection: 'media',
        data: {
          alt: item.alt || item.title || item.filename,
          url: blobUrl,
          filename: item.filename,
          mimeType: item.mimeType,
        },
      })

      mediaMapping[item.wpId] = result.id as number
      created++
    } catch (error) {
      console.error(`Failed to create record for ${item.filename}:`, error)
      failed++
    }

    // Save progress periodically
    if ((i + 1) % batchSize === 0) {
      await fs.writeFile(mappingFile, JSON.stringify(mediaMapping, null, 2))
      console.log(`--- Saved progress: ${Object.keys(mediaMapping).length} mappings ---`)
    }
  }

  // Final save
  await fs.writeFile(mappingFile, JSON.stringify(mediaMapping, null, 2))

  console.log(`\n--- Summary ---`)
  console.log(`Created: ${created}`)
  console.log(`Skipped (already migrated): ${skipped}`)
  console.log(`Failed: ${failed}`)
  console.log(`Not uploaded (missing from blob): ${notUploaded}`)
  console.log(`\nMapping saved to: ${mappingFile}`)
}

main().catch(console.error)
