/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons', 'recharts', 'react-circular-progressbar'],
  },
};

export default nextConfig;
