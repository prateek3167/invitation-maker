import type { NextConfig } from 'next';
import path from 'node:path';

const config: NextConfig = {
  turbopack: { root: path.resolve(import.meta.dirname, '../..') },
  poweredByHeader: false,
  serverExternalPackages: ['@electric-sql/pglite', 'pg', 'better-auth', 'playwright-core', 'nodemailer', 'sharp'],
  outputFileTracingIncludes: { '/api/**/*': ['../../packages/database/migrations/*.sql', './public/royal/*.webp'] },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
    ] }];
  },
};
export default config;
