import { buildConfig } from "payload";
import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@libsql/client";

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

// Check if we're on Vercel non-prod branch
const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.VERCEL_ENV === "production";
const useTurso = isVercel && !isProduction;

// Database configuration
const getDatabaseAdapter = () => {
  if (useTurso) {
    // Use Turso for non-prod Vercel deployments
    const tursoUrl = process.env.MYSQL_TURSO_DATABASE_URL;
    const tursoToken = process.env.MYSQL_TURSO_AUTH_TOKEN;

    if (!tursoUrl || !tursoToken) {
      throw new Error(
        "MYSQL_TURSO_DATABASE_URL and MYSQL_TURSO_AUTH_TOKEN must be set for Vercel deployments"
      );
    }

    const tursoClient = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });

    return sqliteAdapter({
      client: tursoClient as any,
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

  collections: [Users, Media, Posts, Categories, Tags, Pages, GridLayouts],

  typescript: {
    outputFile: path.resolve(dirname, "./payload-types.ts"),
  },

  sharp,

  admin: {
    user: "users",
    meta: {
      titleSuffix: " - Página UM CMS",
    },
    components: {
      graphics: {
        Logo: './src/components/admin/PayloadLogo#PayloadLogo',
      },
    },
  },
});
