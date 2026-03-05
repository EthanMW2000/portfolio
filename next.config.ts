import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d3nlnb6o0sfl9e.cloudfront.net",
      },
    ],
  },
};

export default nextConfig;
