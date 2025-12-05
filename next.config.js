const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@lobehub/fluent-emoji', 'antd-style'],
  images: {
    domains: [],
    formats: ['image/avif', 'image/webp'],
  },
}

module.exports = withNextIntl(nextConfig);
