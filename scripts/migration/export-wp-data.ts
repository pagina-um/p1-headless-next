/**
 * Export WordPress data to JSON files for PayloadCMS migration
 *
 * Usage:
 *   npx tsx scripts/migration/export-wp-data.ts          # Full export
 *   npx tsx scripts/migration/export-wp-data.ts --test   # Last 2 months only
 */

import mysql from 'mysql2/promise'
import fs from 'fs/promises'
import path from 'path'
import { config, setTestMigration } from './config'

// Check for --test flag
if (process.argv.includes('--test')) {
  setTestMigration()
  console.log(`Test migration: exporting posts since ${config.migration.sinceDate}`)
}

interface WPPost {
  ID: number
  post_title: string
  post_content: string
  post_excerpt: string
  post_name: string
  post_date: string
  post_status: string
  post_author: number
}

interface WPTerm {
  term_id: number
  name: string
  slug: string
  taxonomy: string
}

interface WPMedia {
  ID: number
  post_title: string
  guid: string
  post_mime_type: string
}

interface ExportedAuthor {
  wpUserId: number
  name: string
  slug: string
  email: string
  gravatarUrl: string
  wpAvatarUrl: string | null
  wpAvatarAttachmentId: number | null
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

async function main() {
  const connection = await mysql.createConnection(config.mysql)
  console.log('Connected to WordPress MySQL database')

  const outputDir = config.migration.outputDir
  await fs.mkdir(outputDir, { recursive: true })

  try {
    // 1. Export Authors
    console.log('\n--- Exporting Authors ---')
    const authors = await exportAuthors(connection)
    await writeJson(path.join(outputDir, 'authors.json'), authors)
    console.log(`Exported ${authors.length} authors`)

    // 2. Export Categories
    console.log('\n--- Exporting Categories ---')
    const categories = await exportCategories(connection)
    await writeJson(path.join(outputDir, 'categories.json'), categories)
    console.log(`Exported ${categories.length} categories`)

    // 3. Export Tags
    console.log('\n--- Exporting Tags ---')
    const tags = await exportTags(connection)
    await writeJson(path.join(outputDir, 'tags.json'), tags)
    console.log(`Exported ${tags.length} tags`)

    // 4. Export Media
    console.log('\n--- Exporting Media ---')
    const media = await exportMedia(connection)
    await writeJson(path.join(outputDir, 'media.json'), media)
    console.log(`Exported ${media.length} media items`)

    // 5. Export Posts
    console.log('\n--- Exporting Posts ---')
    const posts = await exportPosts(connection)
    await writeJson(path.join(outputDir, 'posts.json'), posts)
    console.log(`Exported ${posts.length} posts`)

    console.log('\n✓ Export complete!')
    console.log(`Files saved to: ${outputDir}`)
  } finally {
    await connection.end()
  }
}

async function exportAuthors(connection: mysql.Connection): Promise<ExportedAuthor[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT
      u.ID,
      u.user_login,
      u.user_email,
      u.display_name,
      um.meta_value as avatar_attachment_id
    FROM ${config.wordpress.tablePrefix}users u
    LEFT JOIN ${config.wordpress.tablePrefix}usermeta um
      ON u.ID = um.user_id AND um.meta_key = 'wp_user_avatar'
    ORDER BY u.display_name
  `)

  const authors: ExportedAuthor[] = []

  for (const row of rows) {
    // Get gravatar URL
    const emailHash = await md5(row.user_email?.toLowerCase().trim() || '')
    const gravatarUrl = `https://www.gravatar.com/avatar/${emailHash}?s=96&d=mp`

    // Get custom avatar URL if exists
    let wpAvatarUrl: string | null = null
    const avatarAttachmentId = row.avatar_attachment_id ? parseInt(row.avatar_attachment_id) : null

    if (avatarAttachmentId) {
      const [avatarRows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT guid FROM ${config.wordpress.tablePrefix}posts WHERE ID = ?`,
        [avatarAttachmentId]
      )
      wpAvatarUrl = avatarRows[0]?.guid || null
    }

    // Generate slug from user_login
    const slug = row.user_login
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')

    authors.push({
      wpUserId: row.ID,
      name: row.display_name,
      slug,
      email: row.user_email,
      gravatarUrl,
      wpAvatarUrl,
      wpAvatarAttachmentId: avatarAttachmentId,
    })
  }

  return authors
}

async function exportCategories(connection: mysql.Connection): Promise<ExportedCategory[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT t.term_id, t.name, t.slug
    FROM ${config.wordpress.tablePrefix}terms t
    JOIN ${config.wordpress.tablePrefix}term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'category'
    ORDER BY t.name
  `)

  return rows.map((row) => ({
    wpId: row.term_id,
    name: row.name,
    slug: row.slug,
  }))
}

async function exportTags(connection: mysql.Connection): Promise<ExportedTag[]> {
  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT t.term_id, t.name, t.slug
    FROM ${config.wordpress.tablePrefix}terms t
    JOIN ${config.wordpress.tablePrefix}term_taxonomy tt ON t.term_id = tt.term_id
    WHERE tt.taxonomy = 'post_tag'
    ORDER BY t.name
  `)

  return rows.map((row) => ({
    wpId: row.term_id,
    name: row.name,
    slug: row.slug,
  }))
}

async function exportMedia(connection: mysql.Connection): Promise<ExportedMedia[]> {
  // Get media attachments with their actual file paths
  let dateFilter = ''
  if (config.migration.sinceDate) {
    dateFilter = `AND m.post_date >= '${config.migration.sinceDate}'`
  }

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT DISTINCT
      m.ID,
      m.post_title,
      m.guid,
      m.post_mime_type,
      pm.meta_value as attached_file
    FROM ${config.wordpress.tablePrefix}posts m
    LEFT JOIN ${config.wordpress.tablePrefix}postmeta pm
      ON m.ID = pm.post_id AND pm.meta_key = '_wp_attached_file'
    WHERE m.post_type = 'attachment'
    ${dateFilter}
    ORDER BY m.ID
  `)

  // Get alt text for each media item
  const mediaItems: ExportedMedia[] = []

  for (const row of rows) {
    const [altRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT meta_value FROM ${config.wordpress.tablePrefix}postmeta WHERE post_id = ? AND meta_key = '_wp_attachment_image_alt'`,
      [row.ID]
    )

    // Use _wp_attached_file if guid doesn't have proper path
    let url = row.guid
    if (row.attached_file && !url.includes('wp-content/uploads')) {
      // Construct proper URL from attached_file path
      url = `${config.wordpress.mediaBaseUrl}${row.attached_file}`
    }

    const filename = row.attached_file
      ? row.attached_file.split('/').pop() || ''
      : url.split('/').pop() || ''

    mediaItems.push({
      wpId: row.ID,
      title: row.post_title || filename,
      url,
      filename,
      mimeType: row.post_mime_type,
      alt: altRows[0]?.meta_value || row.post_title || '',
    })
  }

  return mediaItems
}

async function exportPosts(connection: mysql.Connection): Promise<ExportedPost[]> {
  let dateFilter = ''
  if (config.migration.sinceDate) {
    dateFilter = `AND p.post_date >= '${config.migration.sinceDate}'`
  }

  const [rows] = await connection.execute<mysql.RowDataPacket[]>(`
    SELECT
      p.ID,
      p.post_title,
      p.post_content,
      p.post_excerpt,
      p.post_name,
      p.post_date,
      p.post_status,
      p.post_author
    FROM ${config.wordpress.tablePrefix}posts p
    WHERE p.post_type = 'post'
    AND p.post_status IN ('publish', 'draft')
    ${dateFilter}
    ORDER BY p.post_date DESC
  `)

  const posts: ExportedPost[] = []

  for (const row of rows) {
    // Get featured image
    const [thumbnailRows] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT meta_value FROM ${config.wordpress.tablePrefix}postmeta WHERE post_id = ? AND meta_key = '_thumbnail_id'`,
      [row.ID]
    )
    const featuredImageWpId = thumbnailRows[0]?.meta_value
      ? parseInt(thumbnailRows[0].meta_value)
      : null

    // Get featured image URL
    let featuredImageUrl: string | null = null
    if (featuredImageWpId) {
      const [imageRows] = await connection.execute<mysql.RowDataPacket[]>(
        `SELECT guid FROM ${config.wordpress.tablePrefix}posts WHERE ID = ?`,
        [featuredImageWpId]
      )
      featuredImageUrl = imageRows[0]?.guid || null
    }

    // Get categories
    const [categoryRows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT tt.term_id
      FROM ${config.wordpress.tablePrefix}term_relationships tr
      JOIN ${config.wordpress.tablePrefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ? AND tt.taxonomy = 'category'
    `,
      [row.ID]
    )
    const categoryWpIds = categoryRows.map((r) => r.term_id)

    // Get tags
    const [tagRows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT tt.term_id
      FROM ${config.wordpress.tablePrefix}term_relationships tr
      JOIN ${config.wordpress.tablePrefix}term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
      WHERE tr.object_id = ? AND tt.taxonomy = 'post_tag'
    `,
      [row.ID]
    )
    const tagWpIds = tagRows.map((r) => r.term_id)

    // Get custom fields (ACF first, then Toolset fallback)
    const [metaRows] = await connection.execute<mysql.RowDataPacket[]>(
      `
      SELECT meta_key, meta_value
      FROM ${config.wordpress.tablePrefix}postmeta
      WHERE post_id = ?
      AND meta_key IN ('antetitulo', 'wpcf-antetitulo', 'chamada-destaque', 'wpcf-chamada-destaque', 'chamada-manchete', 'wpcf-chamada-manchete')
    `,
      [row.ID]
    )

    const metaMap: Record<string, string> = {}
    for (const m of metaRows) {
      metaMap[m.meta_key] = m.meta_value
    }

    const antetitulo = metaMap['antetitulo'] || metaMap['wpcf-antetitulo'] || ''
    const chamadaDestaque = metaMap['chamada-destaque'] || metaMap['wpcf-chamada-destaque'] || ''
    const chamadaManchete = metaMap['chamada-manchete'] || metaMap['wpcf-chamada-manchete'] || ''

    // Build URI from date and slug
    const postDate = new Date(row.post_date)
    const year = postDate.getFullYear()
    const month = String(postDate.getMonth() + 1).padStart(2, '0')
    const day = String(postDate.getDate()).padStart(2, '0')
    const uri = `/${year}/${month}/${day}/${row.post_name}`

    posts.push({
      wpId: row.ID,
      title: row.post_title,
      content: row.post_content,
      excerpt: row.post_excerpt,
      slug: row.post_name,
      publishedAt: row.post_date,
      status: row.post_status === 'publish' ? 'publish' : 'draft',
      uri,
      authorWpId: row.post_author,
      featuredImageWpId,
      featuredImageUrl,
      categoryWpIds,
      tagWpIds,
      antetitulo,
      chamadaDestaque,
      chamadaManchete,
    })
  }

  return posts
}

async function writeJson(filePath: string, data: unknown) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// Simple MD5 hash for gravatar
async function md5(str: string): Promise<string> {
  const crypto = await import('crypto')
  return crypto.createHash('md5').update(str).digest('hex')
}

main().catch(console.error)
