// Migration configuration
export const config = {
  mysql: {
    host: '127.0.0.1',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'wordpress',
  },
  wordpress: {
    // Base URL for media files
    mediaBaseUrl: 'https://srv700518.hstgr.cloud/wp-content/uploads/',
    tablePrefix: 'wp_',
  },
  migration: {
    // Filter posts by date (for test migration)
    // Set to null for full migration
    sinceDate: null as string | null, // e.g., '2025-10-01' for last 2 months

    // Output directory for exported JSON
    outputDir: './scripts/migration/data',

    // Batch sizes
    batchSize: 100,
  },
}

// For test migration, set sinceDate to 2 months ago
export function setTestMigration() {
  const twoMonthsAgo = new Date()
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
  config.migration.sinceDate = twoMonthsAgo.toISOString().split('T')[0]
}
