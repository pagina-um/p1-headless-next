import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "./services/config";

export function middleware(request: NextRequest) {
  // Check if the path starts with /admin
  if (
    request.nextUrl.pathname.startsWith("/admin") &&
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_VERCEL_TARGET_ENV === "production"
  ) {
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
