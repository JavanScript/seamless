/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['konva', 'react-konva'],
  reactStrictMode: true,
  webpack: (config) => {
    // This fixes the "Can't resolve 'canvas'" error
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
    };
    return config;
  },
};

export default nextConfig;
