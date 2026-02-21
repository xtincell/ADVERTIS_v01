import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Role-based route guard middleware.
 *
 * Reads the JWT token (no DB call needed — runs on Edge) and checks the
 * user's role against the allowed roles for each protected route prefix.
 *
 * Protects:
 *   /admin      → ADMIN, OPERATOR only
 *   /freelance  → FREELANCE only
 *   /client     → CLIENT_RETAINER, CLIENT_STATIC only
 *   /costs      → ADMIN, OPERATOR only
 *   /pricing    → ADMIN, OPERATOR only
 *
 * All other routes pass through (authentication is handled by the (auth) layout).
 */

const ROLE_ROUTES: Record<string, string[]> = {
  "/admin": ["ADMIN", "OPERATOR"],
  "/freelance": ["FREELANCE"],
  "/client": ["CLIENT_RETAINER", "CLIENT_STATIC"],
  "/costs": ["ADMIN", "OPERATOR"],
  "/pricing": ["ADMIN", "OPERATOR"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Decode JWT without hitting the database
  const token = await getToken({ req });

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Check role-protected routes
  const userRole = (token.role as string) ?? "";
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths (skip API, static, etc.)
  matcher: [
    "/admin/:path*",
    "/freelance/:path*",
    "/client/:path*",
    "/costs/:path*",
    "/pricing/:path*",
  ],
};
