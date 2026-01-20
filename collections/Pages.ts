import { CollectionConfig } from "payload";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { slugify } from "../src/lib/slugify";
import { UploadWithUnsplashFeature } from "../src/lexical/upload-with-unsplash";

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: {
    singular: {
      en: "Page",
      pt: "Página",
    },
    plural: {
      en: "Pages",
      pt: "Páginas",
    },
  },
  admin: {
    group: {
      en: "Content",
      pt: "Conteúdo",
    },
    useAsTitle: "title",
    defaultColumns: ["title", "pageType", "slug", "isHomePage", "updatedAt"],
  },
  access: {
    read: () => true,
  },
  timestamps: true,
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // If setting this page as homepage, unset all other pages
        if (data.isHomePage === true) {
          const payload = req.payload;

          // Find all pages where isHomePage is true
          const existingHomePages = await payload.find({
            collection: "pages",
            where: {
              isHomePage: {
                equals: true,
              },
            },
            limit: 100,
          });

          // Unset isHomePage for all existing home pages
          for (const page of existingHomePages.docs) {
            // Skip if it's the same page being updated
            if (operation === "update" && page.id === data.id) {
              continue;
            }

            await payload.update({
              collection: "pages",
              id: page.id,
              data: {
                isHomePage: false,
              },
            });
          }
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
    {
      name: "isHomePage",
      type: "checkbox",
      defaultValue: false,
      admin: {
        position: "sidebar",
        description:
          "Set this page as the site homepage. Only one page can be the homepage at a time.",
      },
    },
    // Article content - only show if pageType is 'article'
    {
      name: "content",
      type: "richText",
      required: false,
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          // Filter out the default UploadFeature and replace with our custom one
          ...defaultFeatures.filter((feature) => feature.key !== 'upload'),
          UploadWithUnsplashFeature(),
        ],
      }),
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
    // Custom UI component for Edit Grid button
    {
      name: "editGridButton",
      type: "ui",
      admin: {
        position: "sidebar",
        condition: (data) => data.pageType === "grid-layout",
        components: {
          Field: "./collections/components/EditGridButton#EditGridButton",
        },
      },
    },
  ],
};
