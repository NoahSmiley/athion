import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Apple requires apple-app-site-association to be served as application/json
  // with no extension. Files in public/.well-known/ are served raw by Next,
  // but without the right Content-Type Apple's CDN rejects them.
  async headers() {
    return [
      {
        source: "/.well-known/apple-app-site-association",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};

export default nextConfig;
