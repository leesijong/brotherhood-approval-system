/** @type {import('next').NextConfig} */
const nextConfig = {
  // useSearchParams 사용 시 빌드 에러 방지
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // 이미지 최적화 설정 - Railway 배포 최적화
  images: {
    unoptimized: true, // Railway 배포 시 이미지 최적화 비활성화
    domains: [], // 외부 도메인 허용 (필요시 추가)
    formats: ['image/webp', 'image/avif'], // 지원 형식
  },
  // 정적 파일 서빙 최적화
  trailingSlash: false,
  // Railway 배포 최적화
  output: 'standalone',
  // 정적 파일 서빙 강화
  assetPrefix: '',
  // Railway 환경 변수 설정
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    BUILD_VERSION: 'v3.0-elements-fix', // 빌드 버전 추가
  },
  // 빌드 캐시 무효화
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
