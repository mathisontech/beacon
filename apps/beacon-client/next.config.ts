import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@beacon/design-system",
    "@beacon/ui-primitives",
    "@beacon/base-map",
    "@beacon/event-engine",
    "@beacon/data-sources",
  ],
};

export default nextConfig;
