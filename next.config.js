/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  // React Compiler (v16) — auto-memoization of all components
  reactCompiler: true,
  // Turbopack FS cache — persist compiler artifacts across restarts
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
  async rewrites() {
    return [
      {
        source: "/brand/:path*",
        destination: "/impulsion/brand/:path*",
      },
    ];
  },
};

export default config;
