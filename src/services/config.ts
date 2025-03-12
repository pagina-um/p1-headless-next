export const isDevelopment = process.env.NODE_ENV === "development";
export const WP_URL = isDevelopment
  ? "http://127.0.0.1:9400/" // Local WP server
  : process.env.NEXT_PUBLIC_WP_URL;

export const ADMIN_USERNAME = isDevelopment
  ? "admin"
  : process.env.ADMIN_USERNAME;
export const ADMIN_PASSWORD = isDevelopment
  ? "admin"
  : process.env.ADMIN_PASSWORD;
