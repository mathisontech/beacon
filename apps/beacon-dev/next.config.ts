import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@beacon/data-sources",
    "@beacon/design-system",
    "@beacon/event-engine",
  ],
};

export default nextConfig;
