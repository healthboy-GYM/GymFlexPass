/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // 타입 오류가 있으면 프로덕션 빌드를 실패시킨다(권장). 실제 버그를 조기에 잡기 위함.
    ignoreBuildErrors: false,
  },
  eslint: {
    // 린트 오류가 있으면 프로덕션 빌드를 실패시킨다(권장).
    // (react/no-unescaped-entities는 .eslintrc.json에서 비활성화됨)
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
       {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  webpack: (config) => {
    // See https://webpack.js.org/configuration/watch/#watchoptions
    config.watchOptions = {
      ...config.watchOptions,
      poll: 800,
      aggregateTimeout: 300,
    }
    return config
  },
}

module.exports = nextConfig
