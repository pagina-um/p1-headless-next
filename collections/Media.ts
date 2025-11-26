import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    // Disable local storage when using Vercel Blob (token present)
    disableLocalStorage: !!process.env.BLOB_READ_WRITE_TOKEN,
    mimeTypes: ['image/*', 'application/pdf', 'video/*', 'audio/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'featured',
        width: 1200,
        height: 675,
        position: 'centre',
      },
    ],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'textarea',
    },
  ],
}
