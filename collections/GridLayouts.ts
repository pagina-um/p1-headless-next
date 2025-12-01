import { CollectionConfig } from 'payload'

export const GridLayouts: CollectionConfig = {
  slug: 'grid-layouts',
  admin: {
    useAsTitle: 'name',
    description: 'Grid layout configurations for pages',
    defaultColumns: ['name', 'usedBy', 'updatedAt'],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: 'gridEditorRedirect',
      type: 'ui',
      admin: {
        components: {
          Field: './collections/components/GridEditorRedirect#GridEditorRedirect',
        },
      },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name this layout (e.g., "Homepage - December 2025")',
      },
    },
    {
      name: 'gridState',
      type: 'json',
      required: true,
      defaultValue: {
        blocks: [],
        createdAt: '',
      },
      admin: {
        description: 'Grid configuration data including blocks and layout positions',
        readOnly: true,
        hidden: true, // Hidden - use grid editor instead
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Mark as the active homepage layout (only one can be active)',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'usedBy',
      type: 'relationship',
      relationTo: 'pages',
      hasMany: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Pages using this layout',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Track who created the layout
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id
        }

        // If setting this layout as active, deactivate all others
        if (data.isActive === true) {
          await req.payload.update({
            collection: 'grid-layouts',
            where: {
              isActive: {
                equals: true,
              },
            },
            data: {
              isActive: false,
            },
          })
        }

        return data
      },
    ],
    // Removed afterChange hook to prevent infinite loop
    // The usedBy field is not critical and was causing saves to hang
  },
}
