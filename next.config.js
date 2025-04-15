/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  productionBrowserSourceMaps: true,
  experimental: {
    modularizeImports: {
      'lodash': {
        transform: 'lodash/{{member}}',
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**", // This allows all paths. Adjust if needed.
      },
    ],
  },
};

module.exports = nextConfig;
