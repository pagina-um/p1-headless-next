import { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { slugify, buildPostUri } from "../src/lib/slugify";
import { UploadWithUnsplashFeature } from "../src/lexical/upload-with-unsplash";

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
  hooks: {
    beforeValidate: [
      async ({ data, req, originalDoc }) => {
        // Only check URI uniqueness for new posts (existing posts have locked URIs)
        if (originalDoc?.uri || !data?.slug) return data;

        const date = new Date(data.publishedAt || Date.now());
        const uri = buildPostUri(date, data.slug);

        const existing = await req.payload.find({
          collection: "posts",
          where: { uri: { equals: uri } },
          limit: 1,
        });

        if (existing.docs.length > 0) {
          throw new Error(`Já existe um artigo com este URL: ${uri}`);
        }

        return data;
      },
    ],
  },
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
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // Filter out the default UploadFeature and replace with our custom one
          ...defaultFeatures.filter((feature) => feature.key !== 'upload'),
          UploadWithUnsplashFeature(),
        ],
      }),
    },
    {
      name: "excerpt",
      type: "textarea",
      admin: {
        hidden: true,
      },
    },
    {
      name: "visitButton",
      type: "ui",
      admin: {
        position: "sidebar",
        components: {
          Field: "./collections/components/VisitButton#VisitButton",
        },
      },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      admin: {
        position: "sidebar",
        components: {
          Field: {
            path: "./collections/components/SlugField#SlugField",
            clientProps: {
              sourceField: "title",
              readOnly: true,
            },
          },
        },
      },
      hooks: {
        beforeValidate: [
          ({ value, data, originalDoc }) => {
            // Keep existing slug if document exists (lock after creation)
            if (originalDoc?.slug) return originalDoc.slug;
            // Auto-generate from title if empty
            if (!value && data?.title) return slugify(data.title);
            return value;
          },
        ],
      },
    },
    {
      name: "uri",
      type: "text",
      admin: {
        position: "sidebar",
        readOnly: true,
        description: "Full URI path (auto-generated, locked after save)",
      },
      hooks: {
        beforeValidate: [
          ({ data, originalDoc }) => {
            // Keep existing URI if document exists (lock after creation)
            if (originalDoc?.uri) return originalDoc.uri;
            // Auto-generate from publishedAt + slug
            const date = new Date(data?.publishedAt || Date.now());
            const slug = data?.slug || "";
            return buildPostUri(date, slug);
          },
        ],
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
      hooks: {
        beforeValidate: [
          ({ value }) => {
            // Auto-set to current date if empty
            if (!value) return new Date().toISOString();
            return value;
          },
        ],
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
