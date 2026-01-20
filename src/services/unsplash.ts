const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY

export interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  width: number
  height: number
  user: {
    name: string
    username: string
  }
  links: {
    download_location: string
  }
}

export interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashImage[]
}

export async function searchUnsplash(
  query: string,
  page = 1,
  perPage = 20
): Promise<UnsplashSearchResponse> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured')
  }

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
    {
      headers: {
        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      },
    }
  )

  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status}`)
  }

  return res.json()
}

export async function trackDownload(downloadLocation: string): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY is not configured')
  }

  // Unsplash requires triggering download endpoint for attribution tracking
  await fetch(downloadLocation, {
    headers: {
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
    },
  })
}
