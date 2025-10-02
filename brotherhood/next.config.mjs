/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway 배포를 위한 설정
  images: {
    unoptimized: true, // Railway에서 이미지 최적화 비활성화
  },
};

export default nextConfig;