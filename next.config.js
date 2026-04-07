// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  // Removed productionBrowserSourceMaps: true — source maps add ~15-25% to
  // JS asset size and are served to real users, hurting LCP / TBT on mobile.
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
    };
    return config;
  },

  // Tree-shake barrel exports in these packages so only used icons ship
  experimental: {
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa",
      "react-icons/bi",
      "react-icons/bs",
      "react-icons/ai",
      "react-icons/fi",
      "react-icons/ti",
      "react-icons/md",
      "react-icons/io5",
      "@heroicons/react",
      "framer-motion",
    ],
  },

  images: {
    deviceSizes: [320, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
