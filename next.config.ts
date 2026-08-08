import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/kite-onboard/connect": ["node_modules/playwright-core/**/*", "node_modules/@sparticuz/chromium/**/*"],
  },
};

export default nextConfig;
