'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Attachment {
  id: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

interface AttachmentDownloaderProps {
  attachment: Attachment;
  userId?: string;
}

export const AttachmentDownloader: React.FC<AttachmentDownloaderProps> = ({ 
  attachment, 
  userId = 'ac31e829-d5c6-4a1d-92de-439178b12f5f' 
}) => {
  const handleDownload = async () => {
    // 클라이언트 사이드에서만 실행되도록 확인
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      console.warn('클라이언트 환경에서만 다운로드가 가능합니다.');
      return;
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_BASE_URL}/documents/attachments/${attachment.id}/download`, {
        headers: { 'X-User-Id': userId }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        
        // 다운로드 링크 생성 및 클릭
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.originalFilename;
        link.style.display = 'none';
        
        // DOM에 추가하고 클릭 후 제거
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 메모리 정리
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 1000);
        
        console.log(`${attachment.originalFilename} 파일이 다운로드되었습니다.`);
      } else {
        throw new Error('다운로드에 실패했습니다.');
      }
    } catch (error) {
      console.error('파일 다운로드 오류:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDownload}
      className="h-8 w-8 p-0"
    >
      <Download className="h-4 w-4" />
    </Button>
  );
};
