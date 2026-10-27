/** @type {import('next').NextConfig} */
const nextConfig = {
  // App Hosting 빌드 컨테이너 OOM(exit 137) 방지:
  // 정적 생성 병렬 워커 수를 줄여 피크 메모리를 낮추고, 웹팩 메모리 최적화를 켠다.
  experimental: {
    webpackMemoryOptimizations: true,
    cpus: 1,
  },
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
