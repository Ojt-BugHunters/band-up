import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'randomuser.me',
            },
        ],
        domains: ['d33qmu3lctvpye.cloudfront.net'],
    },
};

export default nextConfig;
