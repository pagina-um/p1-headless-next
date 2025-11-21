import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'status'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: false, // Will be populated during migration
    },
    {
      name: 'excerpt',
      type: 'textarea',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'uri',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Full URI path (e.g., /2024/01/15/article-title)',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'publish' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'author',
      type: 'group',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'avatar',
          type: 'text',
        },
      ],
    },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'relationship',
      relationTo: 'tags',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    // WordPress Custom Fields (ACF equivalents)
    {
      name: 'antetitulo',
      type: 'text',
      label: 'Antetítulo',
      admin: {
        description: 'Pre-title or eyebrow text',
      },
    },
    {
      name: 'chamadaDestaque',
      type: 'textarea',
      label: 'Chamada Destaque',
      admin: {
        description: 'Featured call-out text',
      },
    },
    {
      name: 'chamadaManchete',
      type: 'textarea',
      label: 'Chamada Manchete',
      admin: {
        description: 'Headline call-out text',
      },
    },
    {
      name: 'wpDatabaseId',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Original WordPress database ID for migration reference',
      },
    },
  ],
}
