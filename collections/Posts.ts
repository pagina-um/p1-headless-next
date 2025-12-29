import { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { revalidatePath } from "next/cache";
import { slugify, buildPostUri } from "../src/lib/slugify";
import { UploadWithUnsplashFeature } from "../src/lexical/upload-with-unsplash";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: {
    singular: {
      en: "Post",
      pt: "Artigo",
    },
    plural: {
      en: "Posts",
      pt: "Artigos",
    },
  },
  admin: {
    group: {
      en: "Content",
      pt: "Conteúdo",
    },
    useAsTitle: "title",
    defaultColumns: ["title", "publishedAt", "_status"],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true;
      return {
        or: [
          { _status: { equals: "published" } },
          { _status: { exists: false } },
        ],
      };
    },
  },
  timestamps: true,
  versions: {
    maxPerDoc: 100,
    drafts: {
      autosave: {
        interval: 2000,
      },
      validate: false,
    },
  },
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
    afterChange: [
      async ({ doc }) => {
        // Revalidate the post's page cache when status changes (publish/unpublish)
        if (doc.uri) {
          try {
            revalidatePath(doc.uri);
          } catch {
            // Ignore errors during admin render (revalidatePath not allowed in render)
          }
        }
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
            // Lock slug forever once published
            if (originalDoc?.slug && originalDoc?.publishedOnce) {
              return originalDoc.slug;
            }
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
            // Lock URI forever once published
            if (originalDoc?.uri && originalDoc?.publishedOnce) {
              return originalDoc.uri;
            }

            // Auto-generate from publishedAt + slug
            // Compute slug inline since the slug hook may not have run yet
            const date = new Date(data?.publishedAt || Date.now());
            const slug = data?.slug || (data?.title ? slugify(data.title) : "");
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
    {
      name: "publishedOnce",
      type: "checkbox",
      defaultValue: false,
      admin: {
        hidden: true,
      },
      hooks: {
        beforeChange: [
          ({ value, data, originalDoc }) => {
            // Once true, stays true forever
            if (originalDoc?.publishedOnce) return true;
            // Set to true when publishing
            if (data?._status === 'published') return true;
            return value || false;
          },
        ],
      },
    },
  ],
};
