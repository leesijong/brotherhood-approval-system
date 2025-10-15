package com.brotherhood.approval.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 문서 통계 응답 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2025-10-15
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentStatsResponse {
    
    // 기본 현황
    private Long totalDocuments;
    private DocumentsByStatus documentsByStatus;
    
    // 지사별 분포
    private List<BranchDistribution> documentsByBranch;
    
    // 문서 유형별 분포
    private List<DocumentTypeDistribution> documentsByType;
    
    // 보안 등급별 분포
    private List<SecurityLevelDistribution> documentsBySecurityLevel;
    
    // 처리 시간 분석
    private ProcessingTimeStats processingTimeStats;
    
    // 월별 트렌드 (최근 12개월)
    private List<MonthlyTrend> monthlyTrend;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentsByStatus {
        private Long draft;
        private Long pending;
        private Long approved;
        private Long rejected;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BranchDistribution {
        private String branchId;
        private String branchName;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentTypeDistribution {
        private String documentType;
        private Long count;
        private Double avgProcessingDays;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SecurityLevelDistribution {
        private String securityLevel;
        private Long count;
        private Double percentage;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProcessingTimeStats {
        private Double averageDays;
        private Double medianDays;
        private Long longestProcessing;
        private Long quickestProcessing;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyTrend {
        private String month;
        private Long created;
        private Long approved;
        private Long rejected;
    }
}
