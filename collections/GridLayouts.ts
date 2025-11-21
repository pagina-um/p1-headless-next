import { CollectionConfig } from 'payload'

export const GridLayouts: CollectionConfig = {
  slug: 'grid-layouts',
  admin: {
    useAsTitle: 'name',
    description: 'Homepage grid layout configurations',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Homepage Grid',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Set this layout as active for the homepage',
      },
    },
    {
      name: 'gridState',
      type: 'json',
      required: true,
      admin: {
        description: 'Grid configuration data including blocks and layout positions',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // If this layout is being set as active, deactivate all others
        if (data.isActive && operation === 'create') {
          const layouts = await req.payload.find({
            collection: 'grid-layouts',
            where: {
              isActive: {
                equals: true,
              },
            },
          })

          for (const layout of layouts.docs) {
            await req.payload.update({
              collection: 'grid-layouts',
              id: layout.id,
              data: {
                isActive: false,
              },
            })
          }
        }
        return data
      },
    ],
  },
}
