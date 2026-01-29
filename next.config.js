/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    // Security headers applied to all routes
    const securityHeaders = [
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Content-Security-Policy',
        value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.anthropic.com;"
      },
    ];

    return [
      {
        // Security headers for all routes
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // Public API routes - allow CORS from any origin
        // These are intentionally public endpoints for third-party integrations
        source: '/api/v1/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
      // Note: /api/admin/* routes intentionally have NO CORS headers
      // Admin endpoints should only be accessed from same-origin requests
    ];
  },
}

module.exports = nextConfig
