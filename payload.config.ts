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

// Check if we're on Vercel non-prod branch
const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.VERCEL_ENV === "production";
const tursoUrl = process.env.MYSQL_TURSO_DATABASE_URL;
const tursoToken = process.env.MYSQL_TURSO_AUTH_TOKEN;
const useTurso = !!(isVercel && !isProduction && tursoUrl && tursoToken);

// Database configuration
const getDatabaseAdapter = () => {
  if (useTurso) {
    // Use Turso for non-prod Vercel deployments
    console.log("Using Turso database with URL:", tursoUrl);

    if (!tursoUrl || !tursoToken) {
      throw new Error("Turso URL and token must be set");
    }

    return sqliteAdapter({
      client: {
        url: tursoUrl,
        authToken: tursoToken,
      },
    });
  }

  // Use local SQLite for development
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
