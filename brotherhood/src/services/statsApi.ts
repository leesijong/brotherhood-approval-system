import { apiRequest } from './api';
import type { BaseResponse } from '@/types';
import type { DocumentStats } from '@/types/stats';

/**
 * 통계 API 서비스
 */
export const statsApi = {
  /**
   * 문서 통계 조회
   */
  getDocumentStats: async (): Promise<BaseResponse<DocumentStats>> => {
    return apiRequest<DocumentStats>({
      method: 'GET',
      url: '/reports/documents',
    });
  },
};
