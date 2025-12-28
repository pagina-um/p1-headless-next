import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Posts } from "./collections/Posts";
import { Categories } from "./collections/Categories";
import { Tags } from "./collections/Tags";
import { Authors } from "./collections/Authors";
import { Pages } from "./collections/Pages";
import { GridLayouts } from "./collections/GridLayouts";
import { en } from "@payloadcms/translations/languages/en";
import { pt } from "@payloadcms/translations/languages/pt";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Database configuration - use Turso if credentials are available
const tursoUrl = process.env.MYSQL_TURSO_DATABASE_URL;
const tursoToken = process.env.MYSQL_TURSO_AUTH_TOKEN;

const getDatabaseAdapter = () => {
  if (tursoUrl && tursoToken) {
    console.log("Using Turso database");
    return sqliteAdapter({
      client: {
        url: tursoUrl,
        authToken: tursoToken,
      },
    });
  }

  // Fallback to local SQLite
  console.log("Using local SQLite database");
  return sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || "file:./payload.db",
    },
  });
};

export default buildConfig({
  i18n: {
    supportedLanguages: { pt, en },
    fallbackLanguage: "pt",
  },
  secret: process.env.PAYLOAD_SECRET || "your-secret-key-change-in-production",

  db: getDatabaseAdapter(),

  editor: lexicalEditor(),

  collections: [
    Users,
    Media,
    Posts,
    Categories,
    Tags,
    Authors,
    Pages,
    GridLayouts,
  ],

  typescript: {
    outputFile: path.resolve(dirname, "./payload-types.ts"),
  },

  sharp,

  plugins: [
    vercelBlobStorage({
      enabled: !!process.env.BLOB_READ_WRITE_TOKEN,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || "",
    }),
  ],

  admin: {
    user: "users",
    meta: {
      titleSuffix: " - Página UM CMS",
    },
    components: {
      graphics: {
        Logo: "./src/components/admin/PayloadLogo#PayloadLogo",
      },
    },
  },
});
