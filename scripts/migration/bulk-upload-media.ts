/**
 * Bulk upload media files from WordPress backup to Vercel Blob
 *
 * This script uploads ALL files (originals + WP-generated sizes) in parallel.
 * Much faster than processing one at a time.
 *
 * Usage:
 *   npx tsx scripts/migration/bulk-upload-media.ts
 *   npx tsx scripts/migration/bulk-upload-media.ts --concurrency=50
 *   npx tsx scripts/migration/bulk-upload-media.ts --skip=10000
 */

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env.development.local' })

import fs from 'fs/promises'
import { existsSync, readFileSync, statSync } from 'fs'
import path from 'path'
import os from 'os'
import { put } from '@vercel/blob'
import { glob } from 'glob'

const LOCAL_BACKUP_PATH = path.join(
  os.homedir(),
  'Desktop/wp-backup/paginaum.pt__2025-03-19T18_48_24+0000/files/wp-content/uploads'
)

const dataDir = './scripts/migration/data'

// Parse CLI args
const args = process.argv.slice(2)
let concurrency = 20
let skipCount = 0

for (const arg of args) {
  if (arg.startsWith('--concurrency=')) {
    concurrency = parseInt(arg.split('=')[1])
  }
  if (arg.startsWith('--skip=')) {
    skipCount = parseInt(arg.split('=')[1])
  }
}

// Get mime type from file extension
function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.zip': 'application/zip',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

// Process a batch of files in parallel
async function uploadBatch(
  files: string[],
  token: string,
  uploaded: Map<string, string>,
  progressStart: number,
  total: number
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  const results = await Promise.allSettled(
    files.map(async (relativePath, i) => {
      const localPath = path.join(LOCAL_BACKUP_PATH, relativePath)
      const blobPath = `media/${relativePath}`
      const progress = `[${progressStart + i + 1}/${total}]`

      try {
        const buffer = readFileSync(localPath)
        const mimeType = getMimeType(relativePath)

        const blob = await put(blobPath, buffer, {
          access: 'public',
          token,
          contentType: mimeType,
        })

        uploaded.set(relativePath, blob.url)
        console.log(`${progress} ✓ ${relativePath}`)
        return { success: true }
      } catch (error) {
        console.error(`${progress} ✗ ${relativePath}:`, error)
        return { success: false }
      }
    })
  )

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value.success) {
      success++
    } else {
      failed++
    }
  }

  return { success, failed }
}

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    console.error('Error: BLOB_READ_WRITE_TOKEN environment variable is required')
    process.exit(1)
  }

  console.log('BLOB_READ_WRITE_TOKEN is set:', token.substring(0, 20) + '...')
  console.log(`Concurrency: ${concurrency}`)

  if (!existsSync(LOCAL_BACKUP_PATH)) {
    console.error('Error: Local backup not found at', LOCAL_BACKUP_PATH)
    process.exit(1)
  }

  console.log('Scanning files...')
  const allFiles = await glob('**/*', {
    cwd: LOCAL_BACKUP_PATH,
    nodir: true,
  })

  console.log(`Found ${allFiles.length} files`)

  // Skip already processed files
  const toProcess = allFiles.slice(skipCount)
  console.log(`Processing ${toProcess.length} files (skipping ${skipCount})`)

  // Load existing uploads if resuming
  const uploadsFile = path.join(dataDir, 'blob-urls.json')
  const uploaded = new Map<string, string>()

  try {
    const existing = JSON.parse(await fs.readFile(uploadsFile, 'utf-8'))
    for (const [k, v] of Object.entries(existing)) {
      uploaded.set(k, v as string)
    }
    console.log(`Loaded ${uploaded.size} existing uploads`)
  } catch {
    // No existing file
  }

  let totalSuccess = 0
  let totalFailed = 0

  // Process in batches
  for (let i = 0; i < toProcess.length; i += concurrency) {
    const batch = toProcess.slice(i, i + concurrency)

    // Skip files already uploaded
    const newFiles = batch.filter(f => !uploaded.has(f))

    if (newFiles.length === 0) {
      console.log(`Batch ${Math.floor(i / concurrency) + 1}: All files already uploaded, skipping...`)
      continue
    }

    const { success, failed } = await uploadBatch(
      newFiles,
      token,
      uploaded,
      skipCount + i,
      allFiles.length
    )

    totalSuccess += success
    totalFailed += failed

    // Save progress every 100 files
    if ((i + concurrency) % 100 === 0 || i + concurrency >= toProcess.length) {
      const uploadedObj = Object.fromEntries(uploaded)
      await fs.writeFile(uploadsFile, JSON.stringify(uploadedObj, null, 2))
      console.log(`--- Saved progress: ${uploaded.size} files ---`)
    }
  }

  // Final save
  const uploadedObj = Object.fromEntries(uploaded)
  await fs.writeFile(uploadsFile, JSON.stringify(uploadedObj, null, 2))

  console.log(`\n--- Summary ---`)
  console.log(`Success: ${totalSuccess}`)
  console.log(`Failed: ${totalFailed}`)
  console.log(`Total uploaded: ${uploaded.size}`)
  console.log(`\nUploads saved to: ${uploadsFile}`)
}

main().catch(console.error)
