'use client';

import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DownloadButtonProps {
  attachment: {
    id: string;
    originalFilename: string;
    fileSize: number;
  };
  onDownload: (attachment: any) => Promise<void>;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ attachment, onDownload }) => {
  const handleDownload = async () => {
    try {
      await onDownload(attachment);
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
