// ==========================================================================
// Role-based routing utility
// Centralises the mapping between user roles and their home routes.
// Used by: root page, login, register, layouts, middleware.
// ==========================================================================

export type UserRole =
  | "ADMIN"
  | "OPERATOR"
  | "FREELANCE"
  | "CLIENT_RETAINER"
  | "CLIENT_STATIC";

/** Returns the home path for a given role. */
export function getHomeByRole(role: string): string {
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

/** Routes only accessible by ADMIN / OPERATOR. */
export const OPERATOR_ROUTES = [
  "/dashboard",
  "/brand",
  "/new",
  "/tree",
  "/missions",
  "/more",
  "/glory",
];

/** Routes only accessible by FREELANCE. */
export const FREELANCE_ROUTES = [
  "/my-missions",
  "/my-briefs",
  "/upload",
  "/profile",
];

/** Routes only accessible by CLIENT_RETAINER / CLIENT_STATIC. */
export const CLIENT_ROUTES = [
  "/cockpit",
  "/oracle",
  "/my-documents",
  "/requests",
];

/** Full role→routes map for middleware. */
export const ROLE_ROUTE_MAP: Record<string, string[]> = {
  // Operator-only paths
  ...Object.fromEntries(
    OPERATOR_ROUTES.map((r) => [r, ["ADMIN", "OPERATOR"]])
  ),
  // Freelance paths (+ ADMIN preview)
  ...Object.fromEntries(
    FREELANCE_ROUTES.map((r) => [r, ["ADMIN", "FREELANCE"]])
  ),
  // Client paths (+ ADMIN preview)
  ...Object.fromEntries(
    CLIENT_ROUTES.map((r) => [r, ["ADMIN", "CLIENT_RETAINER", "CLIENT_STATIC"]])
  ),
};
