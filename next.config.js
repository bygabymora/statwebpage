// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
    };
    return config;
  },

  images: {
    deviceSizes: [320, 360, 414, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 135, 169, 192, 256, 384],
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

  async redirects() {
    return [
      // Redirect from /news/ to /news to avoid duplicate content issues
      {
        source: "/news/",
        destination: "/news",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
