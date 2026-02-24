import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// -----------------------------------------------------------------------
// Role → route mapping
// Built from the centralised role-routing module (duplicated here because
// middleware runs on the Edge runtime and cannot import from ~/lib).
// -----------------------------------------------------------------------

function getHomeByRole(role: string): string {
  switch (role) {
    case "ADMIN":
    case "OPERATOR":
      return "/dashboard";
    case "FREELANCE":
      return "/my-missions";
    case "CLIENT_RETAINER":
    case "CLIENT_STATIC":
      return "/cockpit";
    default:
      return "/login";
  }
}

const ROLE_ROUTES: Record<string, string[]> = {
  // Operator-only
  "/dashboard": ["ADMIN", "OPERATOR"],
  "/brand": ["ADMIN", "OPERATOR"],
  "/new": ["ADMIN", "OPERATOR"],
  "/tree": ["ADMIN", "OPERATOR"],
  "/missions": ["ADMIN", "OPERATOR"],
  "/more": ["ADMIN", "OPERATOR"],
  "/glory": ["ADMIN", "OPERATOR"],
  // Freelance-only
  "/my-missions": ["FREELANCE"],
  "/my-briefs": ["FREELANCE"],
  "/upload": ["FREELANCE"],
  "/profile": ["FREELANCE"],
  // Client-only
  "/cockpit": ["CLIENT_RETAINER", "CLIENT_STATIC"],
  "/oracle": ["CLIENT_RETAINER", "CLIENT_STATIC"],
  "/my-documents": ["CLIENT_RETAINER", "CLIENT_STATIC"],
  "/requests": ["CLIENT_RETAINER", "CLIENT_STATIC"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Decode JWT without hitting the database
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  // Not logged in → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = (token.role as string) ?? "";

  // Check role-protected routes
  for (const [route, allowedRoles] of Object.entries(ROLE_ROUTES)) {
    if (pathname === route || pathname.startsWith(route + "/")) {
      if (!allowedRoles.includes(userRole)) {
        // Redirect to the user's actual home, not /dashboard
        return NextResponse.redirect(new URL(getHomeByRole(userRole), req.url));
      }
      break;
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware on all protected route prefixes
  matcher: [
    // Operator routes
    "/dashboard/:path*",
    "/brand/:path*",
    "/new/:path*",
    "/tree/:path*",
    "/missions/:path*",
    "/more/:path*",
    "/glory/:path*",
    // Freelance routes
    "/my-missions/:path*",
    "/my-briefs/:path*",
    "/upload/:path*",
    "/profile/:path*",
    // Client routes
    "/cockpit/:path*",
    "/oracle/:path*",
    "/my-documents/:path*",
    "/requests/:path*",
  ],
};
