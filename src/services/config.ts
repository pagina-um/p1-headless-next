export const isDevelopment = false; // process.env.NODE_ENV === "development";
export const WP_URL = isDevelopment
  ? "http://127.0.0.1:9400/" // Local WP server
  : process.env.NEXT_PUBLIC_WP_URL;

export const ADMIN_USERNAME = isDevelopment
  ? "admin"
  : process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = isDevelopment
  ? "admin"
  : process.env.ADMIN_PASSWORD;

// GraphQL Authentication
export const WP_GRAPHQL_API_KEY = isDevelopment
  ? "dev-api-key"
  : process.env.WP_GRAPHQL_API_KEY;

// Configuration validation utility
export function validateGraphQLConfig() {
  const errors: string[] = [];
  
  if (!WP_URL) {
    errors.push("NEXT_PUBLIC_WP_URL is required");
  }
  
  if (!WP_GRAPHQL_API_KEY) {
    errors.push("WP_GRAPHQL_API_KEY is required for authenticated GraphQL requests");
  }
  
  if (errors.length > 0) {
    console.warn("GraphQL configuration issues:", errors);
    return false;
  }
  
  return true;
}

// Admin configuration validation
export function validateAdminConfig() {
  const errors: string[] = [];
  
  if (!ADMIN_USERNAME) {
    errors.push("ADMIN_USERNAME is required for admin operations");
  }
  
  if (!ADMIN_PASSWORD) {
    errors.push("ADMIN_PASSWORD is required for admin operations");
  }
  
  if (errors.length > 0) {
    console.warn("Admin configuration issues:", errors);
    return false;
  }
  
  return true;
}
