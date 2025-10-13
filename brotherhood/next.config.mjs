/** @type {import('next').NextConfig} */
const nextConfig = {
  // Railway 배포를 위한 설정
  images: {
    unoptimized: true, // Railway에서 이미지 최적화 비활성화
    formats: ['image/webp'], // WebP 형식 사용
  },
  
  // 환경 변수 설정
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://brotherhood-approval-system-production.up.railway.app/api',
  },
  
  // 성능 최적화 설정
  compress: true, // Gzip 압축 활성화
  swcMinify: true, // SWC 기반 빠른 minification
  
  // 프로덕션 빌드 최적화
  productionBrowserSourceMaps: false, // 소스맵 비활성화로 번들 크기 감소
  
  // 실험적 기능 (성능 개선)
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-dropdown-menu'], // 패키지 import 최적화
  },
  
  // ESLint 빌드 중 무시 (프로덕션 빌드 속도 향상)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // TypeScript 빌드 중 타입 체크 건너뛰기 (CI/CD에서 별도 실행)
  typescript: {
    ignoreBuildErrors: false, // 타입 오류는 여전히 체크
  },
};

export default nextConfig;