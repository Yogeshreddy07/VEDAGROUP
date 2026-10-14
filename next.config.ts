import type { NextConfig } from 'next';
import { indexingEnabled } from './lib/seo';

const config: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: { qualities: [75, 90] },
  async redirects() {
    // Enable only after removing the host's current non-www -> www redirect.
    return process.env.SEO_CANONICAL_REDIRECT === 'true'
      ? [{ source: '/:path*', has: [{ type: 'host', value: 'www.vedagroup.uk' }], destination: 'https://vedagroup.uk/:path*', permanent: true }]
      : [];
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ...(!indexingEnabled() ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
    ] }];
  },
};
export default config;
