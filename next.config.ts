import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * Development only: lets a phone on the same network open the dev server.
   * Next blocks its dev scripts for any host but localhost, and the symptom is
   * easy to misread: the page renders, but no button or filter responds.
   * The range rather than one address, because a router can reassign it.
   */
  allowedDevOrigins: ['192.168.*.*'],

  /**
   * The bulk import posts the uploaded file to a server action, and a
   * spreadsheet travels base64-encoded because it is a zip archive rather than
   * text — about a third larger than the 512 KB the importer accepts. The
   * default body limit is 1 MB, which that clears only just; 2 MB leaves the
   * cap in one place (IMPORT_MAX_BYTES) instead of having a framework default
   * quietly become the real limit.
   */
  experimental: {
    serverActions: { bodySizeLimit: '2mb' },
  },

  /**
   * `/about` is gone: this release points people at the AI Hub website for
   * anything broader than the directory. A permanent redirect rather than a
   * 404 because the route was live and linked from the header and footer, so
   * shared links and any search index still land somewhere useful instead of
   * dead-ending.
   */
  async redirects() {
    return [
      {
        source: '/about',
        destination: 'https://aihubfordevelopment.org',
        permanent: true,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Design doc 5.7. The full header set — CSP, HSTS with
          // includeSubDomains, frame-ancestors, Permissions-Policy — is SP4.
          // These three cost nothing and need no GA4 compatibility work.
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
