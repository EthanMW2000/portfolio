/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "photography-portfolio-images.s3.us-east-2.amazonaws.com",
      }
    ],
  },
};

module.exports = nextConfig;
