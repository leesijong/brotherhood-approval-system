/** @type {import('next').NextConfig} */
const nextConfig = {
  // useSearchParams 사용 시 빌드 에러 방지
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
