'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import Link from 'next/link'

export const EditGridButton: React.FC = () => {
  const gridLayout = useFormFields(([fields]) => fields.gridLayout)
  const pageType = useFormFields(([fields]) => fields.pageType)

  // Only show if pageType is 'grid-layout'
  if (pageType?.value !== 'grid-layout') {
    return null
  }

  const gridLayoutId = gridLayout?.value

  if (!gridLayoutId) {
    return (
      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '4px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Save this page first, then create a grid layout using the Grid Editor.
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '1rem' }}>
      <Link
        href={`/admin/grid-editor/${gridLayoutId}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#3b82f6'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Edit Grid Layout
      </Link>
    </div>
  )
}
