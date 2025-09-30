/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle PDF.js worker
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };
    
    return config;
  },
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;