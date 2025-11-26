import { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";

export const Posts: CollectionConfig = {
  slug: "posts",
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "status"],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "content",
      type: "richText",
      required: false, // Will be populated during migration
      editor: lexicalEditor(),
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: {
        hidden: true,
      },
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
      name: "uri",
      type: "text",
      admin: {
        position: "sidebar",
        description: "Full URI path (e.g., /2024/01/15/article-title)",
      },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: {
          pickerAppearance: "dayAndTime",
        },
      },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      options: [
        { label: "Draft", value: "draft" },
        { label: "Published", value: "publish" },
      ],
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "wpFeaturedImage",
      type: "group",
      label: "WordPress Featured Image (Legacy)",
      admin: {
        position: "sidebar",
        description: "Featured image URL from WordPress (used during migration)",
      },
      fields: [
        {
          name: "url",
          type: "text",
          label: "Image URL",
        },
        {
          name: "alt",
          type: "text",
          label: "Alt Text",
        },
        {
          name: "width",
          type: "number",
        },
        {
          name: "height",
          type: "number",
        },
      ],
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "authors",
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: {
        position: "sidebar",
      },
    },
    {
      name: "tags",
      type: "relationship",
      relationTo: "tags",
      hasMany: true,
      admin: {
        position: "sidebar",
      },
    },
    // WordPress Custom Fields (ACF equivalents)
    {
      name: "antetitulo",
      type: "text",
      label: "Antetítulo",
      admin: {
        description: "Pre-title or eyebrow text",
      },
    },
    {
      name: "chamadaDestaque",
      type: "textarea",
      label: "Chamada Destaque",
      admin: {
        description: "Featured call-out text",
      },
    },
    {
      name: "chamadaManchete",
      type: "textarea",
      label: "Chamada Manchete",
      admin: {
        description: "Headline call-out text",
      },
    },
    {
      name: "wpDatabaseId",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Original WordPress database ID for migration reference",
      },
    },
  ],
};
