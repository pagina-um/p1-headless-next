'use client'

import React, { useState } from 'react'
import { useSelection } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import { duplicatePosts } from '../../src/app/(payload)/admin/posts/actions'
import { Copy } from 'lucide-react'

export const DuplicatePostsButton: React.FC = () => {
  const { count, getSelectedIds } = useSelection()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Only show when items are selected
  if (count === 0) {
    return null
  }

  const handleDuplicate = async () => {
    setIsLoading(true)
    try {
      const selectedIds = getSelectedIds()
      const postIds = selectedIds.map((id) => Number(id))

      if (postIds.length === 0) {
        alert('Não foi possível obter os artigos selecionados')
        return
      }

      const result = await duplicatePosts(postIds)

      if (result.success) {
        alert(result.message)
        router.refresh()
      } else {
        alert(`Erro: ${result.message}`)
      }
    } catch (error) {
      console.error('Duplicate error:', error)
      alert('Erro ao duplicar artigos')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: '#f0f9ff',
      borderBottom: '1px solid #bae6fd',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '14px', color: '#0369a1' }}>
        {count} artigo(s) selecionado(s)
      </span>
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'wait' : 'pointer',
          fontSize: '13px',
          fontWeight: 500,
        }}
      >
        <Copy size={14} />
        {isLoading ? 'A duplicar...' : 'Duplicar selecionados'}
      </button>
    </div>
  )
}
