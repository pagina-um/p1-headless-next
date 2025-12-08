import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  labels: {
    singular: {
      en: 'Category',
      pt: 'Categoria',
    },
    plural: {
      en: 'Categories',
      pt: 'Categorias',
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
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              // Auto-generate slug from name if not provided
              return data.name
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
            }
            return value
          },
        ],
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
