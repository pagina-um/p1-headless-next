import { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "pageType", "slug", "updatedAt"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === "admin",
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "pageType",
      type: "select",
      required: true,
      defaultValue: "article",
      options: [
        {
          label: "Article (Rich Text)",
          value: "article",
        },
        {
          label: "Grid Layout (Drag & Drop)",
          value: "grid-layout",
        },
      ],
      admin: {
        position: "sidebar",
        description: "Choose how this page should be edited and displayed",
      },
    },
    // Article content - only show if pageType is 'article'
    {
      name: "content",
      type: "richText",
      required: false,
      editor: lexicalEditor(),
      admin: {
        condition: (data) => data.pageType === "article",
        description: "Rich text content for article-type pages",
      },
    },
    // Grid layout - only show if pageType is 'grid-layout'
    {
      name: "gridLayout",
      type: "relationship",
      relationTo: "grid-layouts",
      required: false,
      hasMany: false,
      admin: {
        condition: (data) => data.pageType === "grid-layout",
        description:
          "Select a grid layout or create a new one using the Grid Editor",
        position: "sidebar",
      },
    },
  ],
};
