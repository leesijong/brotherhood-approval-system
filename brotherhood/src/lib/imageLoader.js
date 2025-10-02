// 커스텀 이미지 로더 - Railway 배포 최적화
export default function imageLoader({ src, width, quality }) {
  // Railway에서 정적 파일 서빙 문제 해결
  if (src.startsWith('/images/')) {
    // 절대 경로로 변환하여 Railway에서 정적 파일 서빙 보장
    return `https://brotherhood-frontend-production.up.railway.app${src}`;
  }
  
  // 다른 이미지는 그대로 반환
  return src;
}
