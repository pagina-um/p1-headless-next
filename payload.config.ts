import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Categories } from "./collections/Categories";
import { Tags } from "./collections/Tags";
import { Pages } from "./collections/Pages";
import { GridLayouts } from "./collections/GridLayouts";
import { en } from "@payloadcms/translations/languages/en";
import { pt } from "@payloadcms/translations/languages/pt";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  i18n: {
    supportedLanguages: { pt, en },
    fallbackLanguage: "pt",
  },
  secret: process.env.PAYLOAD_SECRET || "your-secret-key-change-in-production",

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  }),

  editor: lexicalEditor(),

  collections: [Users, Media, Posts, Categories, Tags, Pages, GridLayouts],

  typescript: {
    outputFile: path.resolve(dirname, "./payload-types.ts"),
  },

  sharp,

  admin: {
    user: "users",
    meta: {
      titleSuffix: " - Página UM CMS",
      favicon: "/favicon.ico",
    },
    components: {
      graphics: {
        Logo: './src/components/admin/PayloadLogo#PayloadLogo',
      },
    },
  },
});
