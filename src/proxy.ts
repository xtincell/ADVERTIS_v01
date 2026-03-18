import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// -----------------------------------------------------------------------
// Global API Rate Limiting (Edge-compatible, in-memory)
// -----------------------------------------------------------------------
// Limits per minute per IP:
//   /api/ai/*   → 20 req/min  (AI generation — expensive)
//   /api/mcp/*  → 60 req/min  (MCP server tool calls)
//   /api/*      → 100 req/min (all other API routes)
// -----------------------------------------------------------------------

interface WindowEntry {
  count: number;
  startedAt: number;
}

const rlWindows = new Map<string, WindowEntry>();
let lastCleanup = Date.now();

function rlCleanup(now: number) {
  if (now - lastCleanup < 120_000) return;
  lastCleanup = now;
  for (const [key, entry] of rlWindows) {
    if (now - entry.startedAt > 60_000) rlWindows.delete(key);
  }
}

function checkRateLimit(
  key: string,
  max: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  rlCleanup(now);
  const entry = rlWindows.get(key);

  if (!entry || now - entry.startedAt > 60_000) {
    rlWindows.set(key, { count: 1, startedAt: now });
    return { allowed: true, remaining: max - 1, resetAt: now + 60_000 };
  }

  entry.count += 1;
  if (entry.count > max) {
    return { allowed: false, remaining: 0, resetAt: entry.startedAt + 60_000 };
  }
  return {
    allowed: true,
    remaining: max - entry.count,
    resetAt: entry.startedAt + 60_000,
  };
}

function getMaxRequests(pathname: string): number {
  if (pathname.startsWith("/api/ai/")) return 20;
  if (pathname.startsWith("/api/mcp/")) return 60;
  return 100;
}

// -----------------------------------------------------------------------
// Role → route mapping
// Built from the centralised role-routing module (duplicated here because
// proxy runs on the Edge runtime and cannot import from ~/lib).
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
  // General dashboard
  "/dashboard": ["ADMIN", "OPERATOR"],
  // Operator-only portals
  "/impulsion": ["ADMIN", "OPERATOR"],
  "/pilotis": ["ADMIN", "OPERATOR"],
  "/serenite": ["ADMIN", "OPERATOR"],
  "/glory": ["ADMIN", "OPERATOR"],
  "/tarsis": ["ADMIN", "OPERATOR"],
  "/guilde": ["ADMIN", "OPERATOR"],
  // Freelance (+ ADMIN preview)
  "/my-missions": ["ADMIN", "FREELANCE"],
  "/my-finances": ["ADMIN", "FREELANCE"],
  "/my-briefs": ["ADMIN", "FREELANCE"],
  "/upload": ["ADMIN", "FREELANCE"],
  "/profile": ["ADMIN", "FREELANCE"],
  // Client (+ ADMIN preview)
  "/cockpit": ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  "/oracle": ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  "/my-documents": ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  "/requests": ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"],
  // Brand OS (retainer portal)
  "/os": ["ADMIN", "OPERATOR", "CLIENT_RETAINER"],
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── API rate limiting ──────────────────────────────────────────────
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/auth/")) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "anonymous";
    const bucket = pathname.startsWith("/api/ai/")
      ? "ai"
      : pathname.startsWith("/api/mcp/")
        ? "mcp"
        : "api";
    const max = getMaxRequests(pathname);
    const rl = checkRateLimit(`${bucket}:${ip}`, max);

    if (!rl.allowed) {
      const retryAfter = Math.ceil((rl.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Limite de ${max} requêtes/minute atteinte. Réessayez dans ${retryAfter}s.`,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)),
          },
        },
      );
    }

    // Attach rate limit headers
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(max));
    response.headers.set("X-RateLimit-Remaining", String(rl.remaining));
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.ceil(rl.resetAt / 1000)),
    );
    return response;
  }

  // ── Auth-protected page routes ─────────────────────────────────────
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
        // Redirect to the user's actual home, not /impulsion
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
    // API rate limiting (excludes /api/auth — handled by NextAuth)
    "/api/ai/:path*",
    "/api/mcp/:path*",
    "/api/trpc/:path*",
    "/api/export/:path*",
    "/api/import/:path*",
    "/api/freetext/:path*",
    "/api/template/:path*",
    "/api/market-study/:path*",
    "/api/webhooks/:path*",
    // General dashboard
    "/dashboard/:path*",
    // Operator portals
    "/impulsion/:path*",
    "/pilotis/:path*",
    "/serenite/:path*",
    "/glory/:path*",
    "/tarsis/:path*",
    "/guilde/:path*",
    // Freelance routes
    "/my-missions/:path*",
    "/my-finances/:path*",
    "/my-briefs/:path*",
    "/upload/:path*",
    "/profile/:path*",
    // Client routes
    "/cockpit/:path*",
    "/oracle/:path*",
    "/my-documents/:path*",
    "/requests/:path*",
    // Brand OS
    "/os/:path*",
  ],
};
