/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // VDS'de SSR kullanacağız, static export kapalı
  // output: 'export', // Bu satırı kaldırdık
  
  images: {
    // VDS'de image optimization açık
    unoptimized: false,
    domains: ['localhost', 'images.unsplash.com', 'api.cookify.tr', 'cookify.tr'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.cookify.tr',
        pathname: '/uploads/**',
      },
    ],
  },
  
  // URL'lerde trailing slash (opsiyonel)
  trailingSlash: false,
  
  // Compression
  compress: true,
  
  // Production optimizations
  swcMinify: true,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;
