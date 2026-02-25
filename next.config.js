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
      // Redirect old URL-encoded news article to clean slug
      {
        source:
          "/news/Robotic\\%20Revolution\\%20in\\%20Cardiac\\%20Care\\:\\%20Baylor\\%20St\\.\\%20Luke\\%E2\\%80\\%99s\\%20Completes\\%20First\\%20U\\.S\\.\\%20Fully\\%20Robotic\\%20Heart\\%20Transplant",
        destination:
          "/news/robotic-revolution-in-cardiac-care-baylor-st-luke-s-completes-first-u-s-fully-robotic-heart-transplant",
        permanent: true,
      },
      // Redirect Medtronic URL-encoded article to clean slug
      {
        source:
          "/news/Medtronic\\%E2\\%80\\%99s\\%20Hugo\\%20Surgical\\%20Robot\\%20Achieves\\%20Breakthrough\\%20in\\%20Urologic\\%20Clinical\\%20Trial\\%20\\%E2\\%80\\%94\\%20FDA\\%20Approval\\%20Likely\\%20in\\%202025",
        destination:
          "/news/medtronic-s-hugo-surgical-robot-achieves-breakthrough-in-urologic-clinical-trial-fda-approval-likely-in-2025",
        permanent: true,
      },
      // Redirect Precigen URL with periods and apostrophe
      {
        source:
          "/news/U\\.S\\.-FDA-approves-Precigen\\'s-immunotherapy-for-rare-respiratory-disease",
        destination:
          "/news/u-s-fda-approves-precigen-s-immunotherapy-for-rare-respiratory-disease",
        permanent: true,
      },
      {
        source:
          "/news/surgery-at-the-frontier-cell-therapy-immuno-oncology-and-catheter-innovation-reshape-the-us-surgical-landscape",
        destination:
          "/news/surgery-at-the-frontier-cell-therapy-immuno-oncology-and-catheter-innovation-reshape-the-u-s-surgical-landscape",
        permanent: true,
      },
      {
        source:
          "/products/470015%3Fsrsltid%3DAfmBOoogUmdPW2zeWTB5KgBuIVuopO7KdtK-v1BcY4JhbsA2JcXnrY0s",
        destination: "/products/470015",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
