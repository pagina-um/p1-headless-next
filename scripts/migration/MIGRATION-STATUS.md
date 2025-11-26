# WordPress to PayloadCMS Migration Status

**Last updated:** 2025-11-26

## Phase 1: Infrastructure ✅ COMPLETE
- [x] Installed `@payloadcms/storage-vercel-blob@3.64.0`
- [x] Configured PayloadCMS with Vercel Blob plugin
- [x] Updated Media collection for cloud storage
- [x] Added `BLOB_READ_WRITE_TOKEN` to environment

## Phase 2: Database Migration ✅ COMPLETE
- [x] WordPress backup imported to local Docker MySQL container
- [x] Export scripts created and tested
- [x] Data exported to JSON files

### Exported Data (in `scripts/migration/data/`):
| File | Records |
|------|---------|
| `authors.json` | 129 |
| `categories.json` | 34 |
| `tags.json` | 541 |
| `media.json` | 21,214 |
| `posts.json` | 3,935 |

### Imported to PayloadCMS:
| Collection | Imported | Notes |
|------------|----------|-------|
| Authors | 128 | 1 failed (invalid email) |
| Categories | 34 | 100% |
| Tags | 541 | 100% |
| Posts | 3,893 | 42 failed (duplicate slugs) |

## Phase 3: Media Migration 🔄 IN PROGRESS

### Current Status:
- **6 files uploaded** to Vercel Blob so far
- **Mapping file:** `scripts/migration/data/media-mapping.json`

### Media Breakdown:
| Type | Count | Status |
|------|-------|--------|
| Valid URLs (`wp-content/uploads`) | 21,214 | Ready to migrate |
| Invalid URLs | 0 | Fixed by using `_wp_attached_file` meta |
| **Total** | 21,214 | |

**Note:** Export script was updated to use `_wp_attached_file` meta when `guid` has broken URLs.
This recovered 6,434 previously invalid URLs.

### Local Backup Available:
- **Path:** `~/Desktop/wp-backup/paginaum.pt__2025-03-19T18_48_24+0000/files/wp-content/uploads/`
- **Size:** 25GB
- **Date cutoff:** March 19, 2025
- Files before this date will load from local (fast)
- Files after will download from WordPress server

## How to Resume Media Migration

```bash
# Check current progress
cat scripts/migration/data/media-mapping.json | grep -c ":"

# Run migration (adjust batch size as needed)
npx tsx scripts/migration/migrate-media.ts --batch=500

# The script automatically:
# - Skips already migrated files (checks media-mapping.json)
# - Skips invalid URLs
# - Uses local backup when available
# - Falls back to download for newer files
```

## After Media Migration: Link to Posts

```bash
# Links featuredImage relationships in posts
npx tsx scripts/migration/link-media-to-posts.ts
```

## Docker MySQL Container

The WordPress database is available in a Docker container:

```bash
# Check if running
docker ps | grep wp-migration

# Start if stopped
docker start wp-migration

# Access MySQL
docker exec -it wp-migration mysql -uroot -proot wordpress

# Stop when done
docker stop wp-migration
```

## Key Files

| File | Purpose |
|------|---------|
| `scripts/migration/config.ts` | MySQL connection config |
| `scripts/migration/export-wp-data.ts` | Export WP → JSON |
| `scripts/migration/import-to-payload.ts` | Import JSON → PayloadCMS |
| `scripts/migration/migrate-media.ts` | Upload media to Vercel Blob |
| `scripts/migration/link-media-to-posts.ts` | Link media to posts |
| `scripts/migration/data/media-mapping.json` | WP ID → Payload ID mapping |

## Environment Variables Needed

```bash
# For media migration
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx

# Already configured in .env.local
DATABASE_URI=file:./payload.db
PAYLOAD_SECRET=xxx
```

## Estimated Time for Full Media Migration

- ~14,780 valid files
- ~70% from local backup (instant read)
- ~30% from remote download
- **Estimated total time:** 2-4 hours depending on connection speed
