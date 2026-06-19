/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        // In production, vercel.json handles the routing to serverless function, or we can route it here too if we want.
        // But for local dev, we proxy to the running express server on 5000.
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:5000/api/:path*' 
          : '/server/index.js',
      },
    ];
  },
};

module.exports = nextConfig;
