'use client'

import { useState, useCallback } from 'react'
import { Search, Loader } from 'lucide-react'
import { searchImages, importImage } from '@/app/(payload)/admin/instant-images/actions'
import type { UnsplashImage } from '@/services/unsplash'

interface UnsplashTabProps {
  onSelect: (mediaId: string) => void
  onClose: () => void
}

export const UnsplashTab: React.FC<UnsplashTabProps> = ({ onSelect, onClose }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return

    setLoading(true)
    setError(null)

    try {
      const data = await searchImages(query)
      setResults(data.results)
    } catch (err) {
      setError('Failed to search. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleImport = useCallback(
    async (image: UnsplashImage) => {
      setImporting(image.id)
      setError(null)

      try {
        const result = await importImage(image)
        if (result.success && result.mediaId) {
          onSelect(result.mediaId)
        } else {
          setError(result.error || 'Failed to import image')
        }
      } catch (err) {
        setError('Failed to import. Please try again.')
        console.error(err)
      } finally {
        setImporting(null)
      }
    },
    [onSelect]
  )

  return (
    <div style={{ padding: '16px' }}>
      {/* Search */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for photos..."
          style={{
            flex: 1,
            padding: '10px 14px',
            border: '1px solid var(--theme-elevation-150)',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: 'var(--theme-elevation-0)',
            color: 'var(--theme-elevation-1000)',
          }}
          autoFocus
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 20px',
            backgroundColor: loading ? 'var(--theme-elevation-200)' : 'var(--theme-elevation-1000)',
            color: 'var(--theme-elevation-0)',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
          }}
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </div>

      {error && (
        <p style={{ color: 'var(--theme-error-500)', marginBottom: '12px', fontSize: '14px' }}>
          {error}
        </p>
      )}

      {/* Results */}
      {results.length === 0 && !loading ? (
        <p
          style={{
            textAlign: 'center',
            color: 'var(--theme-elevation-500)',
            padding: '40px 0',
          }}
        >
          Search for photos to get started
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px',
          }}
        >
          {results.map((image) => (
            <div
              key={image.id}
              style={{
                position: 'relative',
                borderRadius: '6px',
                overflow: 'hidden',
                backgroundColor: 'var(--theme-elevation-100)',
              }}
            >
              <img
                src={image.urls.small}
                alt={image.alt_description || 'Unsplash photo'}
                style={{
                  width: '100%',
                  height: '110px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '8px',
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                }}
              >
                <a
                  href={`https://unsplash.com/@${image.user.username}?utm_source=payload_cms&utm_medium=referral`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    color: '#fff',
                    fontSize: '10px',
                    display: 'block',
                    marginBottom: '6px',
                    opacity: 0.9,
                    textDecoration: 'none',
                  }}
                >
                  {image.user.name}
                </a>
                <button
                  type="button"
                  onClick={() => handleImport(image)}
                  disabled={importing === image.id}
                  style={{
                    width: '100%',
                    padding: '5px 10px',
                    backgroundColor: importing === image.id ? '#9ca3af' : '#fff',
                    color: '#000',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: importing === image.id ? 'default' : 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                  }}
                >
                  {importing === image.id ? (
                    <>
                      <Loader size={12} style={{ animation: 'spin 1s linear infinite' }} />
                      Importing...
                    </>
                  ) : (
                    'Use this image'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer attribution */}
      <div
        style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: 'var(--theme-elevation-50)',
          borderRadius: '4px',
          fontSize: '11px',
          color: 'var(--theme-elevation-500)',
          textAlign: 'center',
        }}
      >
        Photos by{' '}
        <a
          href="https://unsplash.com/?utm_source=payload_cms&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--theme-elevation-800)', textDecoration: 'underline' }}
        >
          Unsplash
        </a>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
