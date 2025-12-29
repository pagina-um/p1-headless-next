'use client'

import { useEffect, useRef } from 'react'
import { TextInput, useField, useFormFields } from '@payloadcms/ui'
import { slugify } from '../../src/lib/slugify'

type SlugFieldProps = {
  path: string
  sourceField?: string
  readOnly?: boolean
  label?: string
}

export const SlugField: React.FC<SlugFieldProps> = ({
  path,
  sourceField = 'title',
  readOnly = false,
  label = 'Slug',
}) => {
  const { value, setValue } = useField<string>({ path })
  const sourceValue = useFormFields(([fields]) => fields[sourceField]?.value as string)

  // Check if post has been published (lock slug forever once published)
  const publishedOnce = useFormFields(([fields]) => fields.publishedOnce?.value)
  const isLocked = readOnly && publishedOnce === true

  // Track if user has manually edited the slug
  const hasManualEdit = useRef(false)
  const prevSourceValue = useRef(sourceValue)

  useEffect(() => {
    // Only auto-generate if:
    // 1. Not locked (new document or readOnly is false)
    // 2. User hasn't manually edited the slug
    // 3. Source field has changed
    if (!isLocked && !hasManualEdit.current && sourceValue !== prevSourceValue.current) {
      setValue(slugify(sourceValue || ''))
      prevSourceValue.current = sourceValue
    }
  }, [sourceValue, setValue, isLocked])

  // Reset manual edit flag when creating a new document (publishedOnce is false)
  useEffect(() => {
    if (!publishedOnce) {
      hasManualEdit.current = false
    }
  }, [publishedOnce])

  return (
    <TextInput
      path={path}
      label={label}
      value={value || ''}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isLocked) {
          hasManualEdit.current = true
          setValue(e.target.value)
        }
      }}
      readOnly={isLocked}
      description={isLocked ? 'Locked after publish' : 'Auto-generated from title'}
    />
  )
}
