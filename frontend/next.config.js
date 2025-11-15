/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Static export için (cPanel hosting)
  output: 'export',
  
  images: {
    // cPanel için image optimization kapalı
    unoptimized: true,
    domains: ['localhost', 'images.unsplash.com', 'api.cookify.tr'],
  },
  
  // URL'lerde trailing slash
  trailingSlash: true,
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  },
};

module.exports = nextConfig;
