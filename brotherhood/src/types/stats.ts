/**
 * 통계 관련 타입 정의
 */

export interface DocumentStats {
  // 기본 현황
  totalDocuments: number;
  documentsByStatus: DocumentsByStatus;
  
  // 지사별 분포
  documentsByBranch: BranchDistribution[];
  
  // 문서 유형별 분포
  documentsByType: DocumentTypeDistribution[];
  
  // 보안 등급별 분포
  documentsBySecurityLevel: SecurityLevelDistribution[];
  
  // 처리 시간 분석
  processingTimeStats: ProcessingTimeStats;
  
  // 월별 트렌드 (최근 12개월)
  monthlyTrend: MonthlyTrend[];
}

export interface DocumentsByStatus {
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface BranchDistribution {
  branchId: string;
  branchName: string;
  count: number;
  percentage: number;
}

export interface DocumentTypeDistribution {
  documentType: string;
  count: number;
  avgProcessingDays: number;
}

export interface SecurityLevelDistribution {
  securityLevel: string;
  count: number;
  percentage: number;
}

export interface ProcessingTimeStats {
  averageDays: number;
  medianDays: number;
  longestProcessing: number;
  quickestProcessing: number;
}

export interface MonthlyTrend {
  month: string;
  created: number;
  approved: number;
  rejected: number;
}
