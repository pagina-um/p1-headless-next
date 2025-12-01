import { CollectionConfig } from 'payload'
import { slugify } from '../src/lib/slugify'

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'slug'],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: false,
      unique: true,
      admin: {
        position: 'sidebar',
        components: {
          Field: {
            path: './collections/components/SlugField#SlugField',
            clientProps: {
              sourceField: 'name',
              readOnly: false,
            },
          },
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            // Auto-generate from name if empty
            if (!value && data?.name) return slugify(data.name)
            return value
          },
        ],
      },
    },
    {
      name: 'email',
      type: 'email',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short author biography',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Author profile photo',
      },
    },
    {
      name: 'wpAvatarUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'WordPress avatar URL (fallback during migration)',
      },
    },
    {
      name: 'gravatarUrl',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Gravatar URL based on email',
      },
    },
    {
      name: 'wpUserId',
      type: 'number',
      admin: {
        position: 'sidebar',
        description: 'Original WordPress user ID for migration reference',
      },
    },
  ],
}
