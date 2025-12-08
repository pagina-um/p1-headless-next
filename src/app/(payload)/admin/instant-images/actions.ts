'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { searchUnsplash, trackDownload, UnsplashImage, UnsplashSearchResponse } from '@/services/unsplash'

export async function searchImages(query: string, page = 1): Promise<UnsplashSearchResponse> {
  if (!query.trim()) {
    return { total: 0, total_pages: 0, results: [] }
  }

  const results = await searchUnsplash(query, page, 20)
  return results
}

export async function importImage(image: UnsplashImage): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  try {
    const payload = await getPayload({ config })

    // 1. Trigger Unsplash download tracking (required by API guidelines)
    await trackDownload(image.links.download_location)

    // 2. Fetch the image (use 'regular' size - 1080px width, good balance of quality/size)
    const imageResponse = await fetch(image.urls.regular)
    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image from Unsplash')
    }

    const imageBuffer = await imageResponse.arrayBuffer()

    // 3. Create media record with file upload
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: image.alt_description || image.description || 'Unsplash image',
        caption: `Photo by ${image.user.name} on Unsplash`,
      },
      file: {
        data: Buffer.from(imageBuffer),
        name: `unsplash-${image.id}.jpg`,
        mimetype: 'image/jpeg',
        size: imageBuffer.byteLength,
      },
    })

    return { success: true, mediaId: String(media.id) }
  } catch (error) {
    console.error('Failed to import Unsplash image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to import image'
    }
  }
}
