import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.dirname(fileURLToPath(import.meta.url));

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingRoot: path.join(appDirectory, "../.."),
  outputFileTracingIncludes: {
    "/api/demo/cp": ["../../wiki/previews/first-look.md"],
    "/help/preview": ["../../wiki/previews/first-look.md"],
  },
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "same-origin" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
      { key: "Cache-Control", value: "private, no-store" },
    ] }];
  },
};
export default config;
