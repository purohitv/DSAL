/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: 'dist',
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
