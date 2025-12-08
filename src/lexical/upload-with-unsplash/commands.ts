'use client'

import { createCommand } from '@payloadcms/richtext-lexical/lexical'

// Command to open our custom Unsplash drawer
export const OPEN_UNSPLASH_DRAWER_COMMAND = createCommand<void>('OPEN_UNSPLASH_DRAWER_COMMAND')

// Command to insert upload (reuse from built-in)
export const INSERT_UPLOAD_COMMAND = createCommand<{
  fields: Record<string, unknown> | null
  relationTo: string
  value: string | number
  id?: string
}>('INSERT_UPLOAD_COMMAND')
