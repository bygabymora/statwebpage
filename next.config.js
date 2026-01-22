// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  productionBrowserSourceMaps: true,
  swcMinify: true, // Use SWC for faster minification

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    legacyBrowsers: false,
    browsersListForSwc: true,
    swcTraceProfiling: false,
  },

  // SWC configuration for modern browsers
  swcMinify: true,
  transpilePackages: [],

  // Ensure we use modern JavaScript features
  target: "serverless",

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
    // Remove React dev tools in production
    reactRemoveProperties: process.env.NODE_ENV === "production",
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
    };

    // Optimize for modern JavaScript
    config.target = ["web", "es2020"];

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: "vendor",
            chunks: "all",
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cache static assets for 1 year
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
        has: [
          {
            type: "header",
            key: "accept",
            value: "(.*image.*|.*font.*)",
          },
        ],
      },
      {
        // Cache external CDN resources (Google reCAPTCHA, etc.)
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400", // 24 hours
          },
        ],
      },
    ];
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
