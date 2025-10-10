/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Allow embed.js to be loaded from any domain
        source: '/embed.js',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS' },
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
      {
        // Allow embed widget iframe to be loaded from any domain
        source: '/embed-widget',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'X-Frame-Options', value: 'ALLOWALL' },
        ],
      },
      {
        // Allow API routes to be called from any domain
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
}

module.exports = nextConfig
