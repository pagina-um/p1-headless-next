'use client'

import { useLexicalComposerContext } from '@payloadcms/richtext-lexical/lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot } from '@payloadcms/richtext-lexical/lexical/utils'
import {
  $getSelection,
  $getPreviousSelection,
  $isRangeSelection,
  $isParagraphNode,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from '@payloadcms/richtext-lexical/lexical'
import { useEffect, useState, useCallback } from 'react'
import { Drawer, useListDrawer, useEditDepth, useModal } from '@payloadcms/ui'
import { $createUploadNode } from '@payloadcms/richtext-lexical/client'
import { OPEN_UNSPLASH_DRAWER_COMMAND } from './commands'
import { UnsplashTab } from './UnsplashTab'

// Our own command to open the tabbed drawer
export const OPEN_TABBED_UPLOAD_DRAWER_COMMAND = createCommand<void>('OPEN_TABBED_UPLOAD_DRAWER_COMMAND')

export const UnsplashPlugin: React.FC = () => {
  const [editor] = useLexicalComposerContext()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'unsplash'>('library')
  const editDepth = useEditDepth()
  const drawerSlug = `unsplash-upload-drawer-${editDepth}`
  const { openModal, closeModal, isModalOpen } = useModal()

  // Media library list drawer
  const [ListDrawer, , { openDrawer: openListDrawer, closeDrawer: closeListDrawer }] = useListDrawer({
    collectionSlugs: ['media'],
    uploads: true,
  })

  const handleInsertUpload = useCallback(
    (collectionSlug: string, docId: string | number) => {
      editor.update(() => {
        const selection = $getSelection() || $getPreviousSelection()
        if ($isRangeSelection(selection)) {
          const uploadNode = $createUploadNode({
            data: {
              fields: {},
              relationTo: collectionSlug as 'media',
              value: Number(docId),
            },
          })
          const { focus } = selection
          const focusNode = focus.getNode()
          $insertNodeToNearestRoot(uploadNode)
          if ($isParagraphNode(focusNode) && !focusNode.__first) {
            focusNode.remove()
          }
        }
      })
    },
    [editor]
  )

  const handleMediaSelect = useCallback(
    ({ collectionSlug, docID }: { collectionSlug: string; doc: unknown; docID: string }) => {
      closeListDrawer()
      closeModal(drawerSlug)
      setIsOpen(false)
      handleInsertUpload(collectionSlug, docID)
    },
    [closeListDrawer, closeModal, drawerSlug, handleInsertUpload]
  )

  const handleUnsplashSelect = useCallback(
    (mediaId: string) => {
      closeModal(drawerSlug)
      setIsOpen(false)
      handleInsertUpload('media', mediaId)
    },
    [closeModal, drawerSlug, handleInsertUpload]
  )

  const handleClose = useCallback(() => {
    closeModal(drawerSlug)
    setIsOpen(false)
  }, [closeModal, drawerSlug])

  const openTabbedDrawer = useCallback(() => {
    setIsOpen(true)
    setActiveTab('library')
    openModal(drawerSlug)
  }, [openModal, drawerSlug])

  useEffect(() => {
    // Register our command to open the tabbed drawer
    const unregister = editor.registerCommand(
      OPEN_TABBED_UPLOAD_DRAWER_COMMAND,
      () => {
        openTabbedDrawer()
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )

    // Also handle the legacy command
    const unregister2 = editor.registerCommand(
      OPEN_UNSPLASH_DRAWER_COMMAND,
      () => {
        openTabbedDrawer()
        return true
      },
      COMMAND_PRIORITY_EDITOR
    )

    return () => {
      unregister()
      unregister2()
    }
  }, [editor, openTabbedDrawer])

  const tabStyle = (tab: 'library' | 'unsplash') => ({
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    background: activeTab === tab ? 'var(--theme-elevation-0)' : 'var(--theme-elevation-50)',
    borderBottom: activeTab === tab ? '2px solid var(--theme-elevation-1000)' : '2px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: activeTab === tab ? 600 : 400,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: activeTab === tab ? 'var(--theme-elevation-1000)' : 'var(--theme-elevation-500)',
    transition: 'all 0.15s ease',
  })

  if (!isOpen) return null

  return (
    <>
      <Drawer slug={drawerSlug} gutter={false} Header={null}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Tabs */}
          <div style={{ borderBottom: '1px solid var(--theme-elevation-150)' }}>
            <div style={{ display: 'flex' }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('library')
                  openListDrawer()
                }}
                style={tabStyle('library')}
              >
                Media Library
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('unsplash')}
                style={tabStyle('unsplash')}
              >
                Stock Photos
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'library' ? (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--theme-elevation-500)' }}>
                <p style={{ marginBottom: '16px' }}>
                  Select an existing image or upload a new one from your Media Library.
                </p>
                <button
                  type="button"
                  onClick={openListDrawer}
                  style={{
                    padding: '10px 24px',
                    backgroundColor: 'var(--theme-elevation-1000)',
                    color: 'var(--theme-elevation-0)',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                  }}
                >
                  Browse Media Library
                </button>
              </div>
            ) : (
              <UnsplashTab onSelect={handleUnsplashSelect} onClose={handleClose} />
            )}
          </div>
        </div>
      </Drawer>

      {/* Nested Media Library Drawer */}
      <ListDrawer onSelect={handleMediaSelect} />
    </>
  )
}
