/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.zonaprop.com' },
      { protocol: 'https', hostname: 'cdn.zonaprop.com' },
      { protocol: 'https', hostname: 'assets.argenprop.com' },
      { protocol: 'https', hostname: 'http2.mlstatic.com' },
      { protocol: 'https', hostname: 'mlstatic-quimaca.s3.us-east-1.amazonaws.com' },
    ],
  },
  poweredByHeader: false,
}

module.exports = nextConfig
