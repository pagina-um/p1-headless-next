import { CollectionConfig } from 'payload'
import { slugify } from '../src/lib/slugify'

export const Tags: CollectionConfig = {
  slug: 'tags',
  labels: {
    singular: {
      en: 'Tag',
      pt: 'Tag',
    },
    plural: {
      en: 'Tags',
      pt: 'Tags',
    },
  },
  admin: {
    group: {
      en: 'Content',
      pt: 'Conteúdo',
    },
    useAsTitle: 'name',
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
  ],
}
