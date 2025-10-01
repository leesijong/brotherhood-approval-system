/** @type {import('next').NextConfig} */
const nextConfig = {
  // useSearchParams 사용 시 빌드 에러 방지
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // 이미지 최적화 설정
  images: {
    unoptimized: true, // Railway 배포 시 이미지 최적화 비활성화
  },
};

export default nextConfig;
