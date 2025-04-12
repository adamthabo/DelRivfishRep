/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: [
        'waterdata.usgs.gov',
        'water.weather.gov',
        'api.weather.gov'
      ],
    },
    async headers() {
      return [
        {
          // Set CORS headers for API routes
          source: '/api/:path*',
          headers: [
            { key: 'Access-Control-Allow-Credentials', value: 'true' },
            { key: 'Access-Control-Allow-Origin', value: '*' },
            { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
            { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
          ],
        },
      ]
    },
    // Optimize for fast refresh during development
    webpack: (config, { dev, isServer }) => {
      if (dev && !isServer) {
        // Split chunks for better development experience
        config.optimization.splitChunks.cacheGroups = {
          ...config.optimization.splitChunks.cacheGroups,
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
            name: 'framework',
            chunks: 'all',
          },
          lib: {
            test: /[\\/]node_modules[\\/](recharts|d3|lucide-react)[\\/]/,
            name: 'lib',
            chunks: 'all',
          },
        };
      }
      return config;
    },
  };
  
  module.exports = nextConfig;
