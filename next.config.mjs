/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://fitness-api:8000/:path*',
        // destination: 'https://fitness.martibusquets.cat/api/:path*',
      },
    ];
  },
};

export default nextConfig;
