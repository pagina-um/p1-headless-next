import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Get the Authorization header
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      // No auth header, return 401 with WWW-Authenticate header
      return new NextResponse(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
        },
      });
    }

    try {
      // Get the credentials from the Authorization header
      const credentials = authHeader.split(" ")[1];
      const [username, password] = atob(credentials).split(":");

      // Replace these with your actual credentials
      // In production, use environment variables and secure storage
      const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Authentication successful, continue to the route
        return NextResponse.next();
      }

      // Invalid credentials, return 401
      return new NextResponse(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
        },
      });
    } catch (_e) {
      // Error parsing credentials, return 401
      return new NextResponse(null, {
        status: 401,
        headers: {
          "WWW-Authenticate": 'Basic realm="Admin Area"',
        },
      });
    }
  }

  // Not an admin route, continue normally
  return NextResponse.next();
}

// Configure the middleware to only run on /admin routes
export const config = {
  matcher: "/admin/:path*",
};
