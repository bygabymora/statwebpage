/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: true,
  swcMinify: true,
  experimental: {
    optimizeCss: true,
    esmExternals: true,
  },
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      buffer: false,
    };
    return config;
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
