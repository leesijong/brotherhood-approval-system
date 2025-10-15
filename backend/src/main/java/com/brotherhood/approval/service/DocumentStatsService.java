package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.stats.DocumentStatsResponse;
import com.brotherhood.approval.repository.DocumentRepository;
import com.brotherhood.approval.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 문서 통계 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2025-10-15
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DocumentStatsService {
    
    private final DocumentRepository documentRepository;
    private final BranchRepository branchRepository;
    
    /**
     * 문서 통계 조회
     */
    public DocumentStatsResponse getDocumentStats() {
        log.info("문서 통계 조회 시작");
        
        try {
            // 기본 현황
            Long totalDocuments = documentRepository.count();
            DocumentStatsResponse.DocumentsByStatus documentsByStatus = getDocumentsByStatus();
            
            // 지사별 분포
            List<DocumentStatsResponse.BranchDistribution> documentsByBranch = getDocumentsByBranch();
            
            // 문서 유형별 분포
            List<DocumentStatsResponse.DocumentTypeDistribution> documentsByType = getDocumentsByType();
            
            // 보안 등급별 분포
            List<DocumentStatsResponse.SecurityLevelDistribution> documentsBySecurityLevel = getDocumentsBySecurityLevel();
            
            // 처리 시간 분석
            DocumentStatsResponse.ProcessingTimeStats processingTimeStats = getProcessingTimeStats();
            
            // 월별 트렌드 (최근 12개월)
            List<DocumentStatsResponse.MonthlyTrend> monthlyTrend = getMonthlyTrend();
            
            DocumentStatsResponse response = DocumentStatsResponse.builder()
                    .totalDocuments(totalDocuments)
                    .documentsByStatus(documentsByStatus)
                    .documentsByBranch(documentsByBranch)
                    .documentsByType(documentsByType)
                    .documentsBySecurityLevel(documentsBySecurityLevel)
                    .processingTimeStats(processingTimeStats)
                    .monthlyTrend(monthlyTrend)
                    .build();
            
            log.info("문서 통계 조회 완료: 총 {}개 문서", totalDocuments);
            return response;
            
        } catch (Exception e) {
            log.error("문서 통계 조회 실패", e);
            throw new RuntimeException("문서 통계 조회 중 오류가 발생했습니다.", e);
        }
    }
    
    /**
     * 상태별 문서 수 조회
     */
    private DocumentStatsResponse.DocumentsByStatus getDocumentsByStatus() {
        List<Object[]> results = documentRepository.countByStatus();
        Map<String, Long> statusCounts = results.stream()
                .collect(Collectors.toMap(
                    result -> (String) result[0],
                    result -> ((Number) result[1]).longValue()
                ));
        
        return DocumentStatsResponse.DocumentsByStatus.builder()
                .draft(statusCounts.getOrDefault("DRAFT", 0L))
                .pending(statusCounts.getOrDefault("PENDING", 0L))
                .approved(statusCounts.getOrDefault("APPROVED", 0L))
                .rejected(statusCounts.getOrDefault("REJECTED", 0L))
                .build();
    }
    
    /**
     * 지사별 문서 분포 조회
     */
    private List<DocumentStatsResponse.BranchDistribution> getDocumentsByBranch() {
        List<Object[]> results = documentRepository.countByBranch();
        Long totalDocuments = documentRepository.count();
        
        return results.stream()
                .map(result -> {
                    String branchId = (String) result[0];
                    String branchName = (String) result[1];
                    Long count = ((Number) result[2]).longValue();
                    Double percentage = totalDocuments > 0 ? (count.doubleValue() / totalDocuments) * 100 : 0.0;
                    
                    return DocumentStatsResponse.BranchDistribution.builder()
                            .branchId(branchId)
                            .branchName(branchName)
                            .count(count)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 문서 유형별 분포 조회
     */
    private List<DocumentStatsResponse.DocumentTypeDistribution> getDocumentsByType() {
        List<Object[]> results = documentRepository.countByDocumentType();
        
        return results.stream()
                .map(result -> {
                    String documentType = (String) result[0];
                    Long count = ((Number) result[1]).longValue();
                    Double avgProcessingDays = calculateAvgProcessingDays(documentType);
                    
                    return DocumentStatsResponse.DocumentTypeDistribution.builder()
                            .documentType(documentType)
                            .count(count)
                            .avgProcessingDays(Math.round(avgProcessingDays * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 보안 등급별 분포 조회
     */
    private List<DocumentStatsResponse.SecurityLevelDistribution> getDocumentsBySecurityLevel() {
        List<Object[]> results = documentRepository.countBySecurityLevel();
        Long totalDocuments = documentRepository.count();
        
        return results.stream()
                .map(result -> {
                    String securityLevel = (String) result[0];
                    Long count = ((Number) result[1]).longValue();
                    Double percentage = totalDocuments > 0 ? (count.doubleValue() / totalDocuments) * 100 : 0.0;
                    
                    return DocumentStatsResponse.SecurityLevelDistribution.builder()
                            .securityLevel(securityLevel)
                            .count(count)
                            .percentage(Math.round(percentage * 100.0) / 100.0)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 처리 시간 통계 조회
     */
    private DocumentStatsResponse.ProcessingTimeStats getProcessingTimeStats() {
        // 실제 구현에서는 더 복잡한 쿼리가 필요하지만, 
        // 현재는 기본적인 통계만 제공
        return DocumentStatsResponse.ProcessingTimeStats.builder()
                .averageDays(5.2)
                .medianDays(3.0)
                .longestProcessing(30L)
                .quickestProcessing(1L)
                .build();
    }
    
    /**
     * 월별 트렌드 조회 (최근 12개월)
     */
    private List<DocumentStatsResponse.MonthlyTrend> getMonthlyTrend() {
        List<Object[]> results = documentRepository.getMonthlyTrend();
        
        return results.stream()
                .map(result -> {
                    String month = (String) result[0];
                    Long created = ((Number) result[1]).longValue();
                    Long approved = ((Number) result[2]).longValue();
                    Long rejected = ((Number) result[3]).longValue();
                    
                    return DocumentStatsResponse.MonthlyTrend.builder()
                            .month(month)
                            .created(created)
                            .approved(approved)
                            .rejected(rejected)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    /**
     * 문서 유형별 평균 처리 일수 계산
     */
    private Double calculateAvgProcessingDays(String documentType) {
        // 실제 구현에서는 문서 생성일과 승인일의 차이를 계산
        // 현재는 임시 데이터 반환
        return switch (documentType) {
            case "REPORT" -> 3.5;
            case "REQUEST" -> 5.2;
            case "APPROVAL" -> 2.1;
            case "NOTICE" -> 1.0;
            default -> 4.0;
        };
    }
}
