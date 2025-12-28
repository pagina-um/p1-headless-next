'use client'

import { useState, useCallback } from 'react'
import { Camera, Search, X, Loader, Check } from 'lucide-react'
import { searchImages, importImage } from '@/app/(payload)/admin/instant-images/actions'
import type { UnsplashImage } from '@/services/unsplash'

export const InstantImagesButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<UnsplashImage[]>([])
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState<string | null>(null)
  const [imported, setImported] = useState<Set<string>>(new Set())
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

  const handleImport = useCallback(async (image: UnsplashImage) => {
    setImporting(image.id)
    setError(null)

    try {
      const result = await importImage(image)
      if (result.success) {
        setImported(prev => new Set(prev).add(image.id))
      } else {
        setError(result.error || 'Failed to import image')
      }
    } catch (err) {
      setError('Failed to import. Please try again.')
      console.error(err)
    } finally {
      setImporting(null)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setQuery('')
    setResults([])
    setError(null)
    setImported(new Set())
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#000',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          width: '100%',
          justifyContent: 'center',
        }}
      >
        <Camera size={18} />
        Stock Photos
      </button>

      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose()
          }}
        >
          <div
            style={{
              backgroundColor: '#fff',
              borderRadius: '8px',
              width: '90%',
              maxWidth: '900px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>
                Search Unsplash
              </h2>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e5e5' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for photos..."
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                  }}
                  autoFocus
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 20px',
                    backgroundColor: loading ? '#9ca3af' : '#000',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
                  Search
                </button>
              </div>

              {error && (
                <p style={{ color: '#dc2626', marginTop: '8px', fontSize: '14px' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Results */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
              }}
            >
              {results.length === 0 && !loading && (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
                  Search for photos to get started
                </p>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '16px',
                }}
              >
                {results.map((image) => (
                  <div
                    key={image.id}
                    style={{
                      position: 'relative',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f3f4f6',
                    }}
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt_description || 'Unsplash photo'}
                      style={{
                        width: '100%',
                        height: '150px',
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
                          fontSize: '11px',
                          display: 'block',
                          marginBottom: '6px',
                          opacity: 0.9,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {image.user.name}
                      </a>
                      <button
                        onClick={() => handleImport(image)}
                        disabled={importing === image.id || imported.has(image.id)}
                        style={{
                          width: '100%',
                          padding: '6px 12px',
                          backgroundColor: imported.has(image.id)
                            ? '#16a34a'
                            : importing === image.id
                              ? '#9ca3af'
                              : '#fff',
                          color: imported.has(image.id) ? '#fff' : '#000',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: importing === image.id || imported.has(image.id) ? 'default' : 'pointer',
                          fontSize: '12px',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                        }}
                      >
                        {imported.has(image.id) ? (
                          <>
                            <Check size={14} /> Imported
                          </>
                        ) : importing === image.id ? (
                          <>
                            <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Importing...
                          </>
                        ) : (
                          'Import'
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid #e5e5e5',
                backgroundColor: '#f9fafb',
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Photos by{' '}
              <a
                href="https://unsplash.com/?utm_source=payload_cms&utm_medium=referral"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#000', textDecoration: 'underline' }}
              >
                Unsplash
              </a>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
