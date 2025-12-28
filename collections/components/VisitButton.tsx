'use client'

import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { ExternalLink } from 'lucide-react'

export const VisitButton: React.FC = () => {
  const { id } = useDocumentInfo()
  const uri = useFormFields(([fields]) => fields.uri?.value as string)

  const isDisabled = !id || !uri

  const handleClick = () => {
    if (uri) {
      window.open(uri, '_blank')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 16px',
        backgroundColor: isDisabled ? '#e0e0e0' : '#f5f5f5',
        color: isDisabled ? '#999' : '#333',
        border: '1px solid #ccc',
        borderRadius: '4px',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#e8e8e8'
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.backgroundColor = '#f5f5f5'
        }
      }}
      title={isDisabled ? 'Save the post first to visit' : `Visit ${uri}`}
    >
      <ExternalLink size={16} />
      Visit
    </button>
  )
}
