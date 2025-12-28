'use client'

import { createClientFeature, UploadNode } from '@payloadcms/richtext-lexical/client'
import { ImageIcon } from 'lucide-react'
import { UnsplashPlugin, OPEN_TABBED_UPLOAD_DRAWER_COMMAND } from './plugin'

const UploadIconComponent: React.FC = () => <ImageIcon size={20} />

export const UploadWithUnsplashFeatureClient = createClientFeature({
  nodes: [UploadNode],
  plugins: [
    {
      Component: UnsplashPlugin,
      position: 'normal',
    },
  ],
  slashMenu: {
    groups: [
      {
        items: [
          {
            Icon: UploadIconComponent,
            key: 'upload',
            keywords: ['upload', 'image', 'file', 'img', 'picture', 'photo', 'media', 'unsplash', 'stock'],
            label: ({ i18n }) => i18n.t('lexical:upload:label') || 'Upload',
            onSelect: ({ editor }) => {
              editor.dispatchCommand(OPEN_TABBED_UPLOAD_DRAWER_COMMAND, undefined)
            },
          },
        ],
        key: 'basic',
        label: ({ i18n }) => i18n.t('lexical:slashMenu:basic:label') || 'Basic',
      },
    ],
  },
})
