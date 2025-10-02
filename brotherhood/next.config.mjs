/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway 배포를 위한 설정
  images: {
    unoptimized: true, // Railway에서 이미지 최적화 비활성화
  },
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api',
  },
};

export default nextConfig;