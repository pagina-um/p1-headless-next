'use client'

import React from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import Link from 'next/link'

export const GridEditorRedirect: React.FC = () => {
  const { id } = useDocumentInfo()

  // If no ID (creating new layout), show message
  if (!id) {
    return (
      <div style={{
        marginBottom: '2rem',
        padding: '1.5rem',
        backgroundColor: '#f3f4f6',
        borderRadius: '8px',
        border: '2px solid #e5e7eb'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
          Save this grid layout first, then use the Grid Editor to design it.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: '#eff6ff',
      borderRadius: '8px',
      border: '2px solid #3b82f6'
    }}>
      <h3 style={{
        margin: '0 0 0.75rem 0',
        fontSize: '16px',
        fontWeight: '600',
        color: '#1e40af'
      }}>
        Grid Editor
      </h3>
      <p style={{
        margin: '0 0 1rem 0',
        fontSize: '14px',
        color: '#1e40af',
        lineHeight: '1.5'
      }}>
        Use the Grid Editor to design this layout with drag-and-drop blocks.
      </p>
      <Link
        href={`/admin/grid-editor/${id}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
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
        Open Grid Editor
      </Link>
    </div>
  )
}
