package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.ApprovalLine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 결재선 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface ApprovalLineRepository extends JpaRepository<ApprovalLine, UUID> {
    
    /**
     * 문서별 결재선 조회
     */
    List<ApprovalLine> findByDocumentId(UUID documentId);
    
    /**
     * 병렬 결재선 조회
     */
    List<ApprovalLine> findByIsParallelTrue();
    
    /**
     * 조건부 결재선 조회
     */
    List<ApprovalLine> findByIsConditionalTrue();
    
    /**
     * 결재선 이름으로 조회
     */
    Optional<ApprovalLine> findByName(String name);
    
    /**
     * 결재선 이름 중복 확인
     */
    boolean existsByName(String name);
    
    /**
     * 문서별 결재선 수 조회
     */
    long countByDocumentId(UUID documentId);
    
    /**
     * 결재선별 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId")
    long countApprovalStepsByApprovalLineId(@Param("approvalLineId") UUID approvalLineId);
    
    // 교차 지사, 결재 유형, 대상 지사, 활성/비활성 관련 필드는 현재 엔티티에서 지원하지 않음
}

