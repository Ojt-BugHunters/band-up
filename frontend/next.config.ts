import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'picsum.photos',
            },
            {
                protocol: 'https',
                hostname: 'i.pravatar.cc',
            },
            {
                protocol: 'https',
                hostname: 'ieltstrainingonline.com',
            },
            {
                protocol: 'https',
                hostname: 'd3s4wd2jidlo5b.cloudfront.net',
            },
        ],
        domains: ['d3s4wd2jidlo5b.cloudfront.net', 'api.microlink.io'],
    },
};

export default nextConfig;
