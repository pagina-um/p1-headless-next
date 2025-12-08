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

  // Check if document has been saved (has an id)
  const docId = useFormFields(([fields]) => fields.id?.value)
  const isLocked = readOnly && !!docId

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

  // Reset manual edit flag when source changes significantly (new document)
  useEffect(() => {
    if (!docId) {
      hasManualEdit.current = false
    }
  }, [docId])

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
      description={isLocked ? 'Locked after save' : 'Auto-generated from title'}
    />
  )
}
