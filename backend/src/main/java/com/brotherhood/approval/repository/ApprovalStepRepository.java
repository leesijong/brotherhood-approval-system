package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.ApprovalStep;
// Removed enum imports - using String types
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 결재단계 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface ApprovalStepRepository extends JpaRepository<ApprovalStep, UUID> {
    
    /**
     * 결재선별 결재단계 조회 (순서대로)
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId ORDER BY ast.stepOrder ASC")
    List<ApprovalStep> findByApprovalLineIdOrderByStepOrder(@Param("approvalLineId") UUID approvalLineId);
    
    /**
     * 결재자별 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.approver.id = :approverId")
    List<ApprovalStep> findByApproverId(@Param("approverId") UUID approverId);
    
    /**
     * 결재자별 상태별 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.approver.id = :approverId AND ast.status = :status")
    List<ApprovalStep> findByApproverIdAndStatus(@Param("approverId") UUID approverId, @Param("status") String status);
    
    /**
     * 결재선별 상태별 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId AND ast.status = :status")
    List<ApprovalStep> findByApprovalLineIdAndStatus(@Param("approvalLineId") UUID approvalLineId, @Param("status") String status);
    
    /**
     * 결재선별 다음 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE " +
           "ast.approvalLine.id = :approvalLineId AND " +
           "ast.status = 'PENDING' " +
           "ORDER BY ast.stepOrder ASC")
    List<ApprovalStep> findNextPendingStepsByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 현재 진행중인 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE " +
           "ast.approvalLine.id = :approvalLineId AND " +
           "ast.status = 'IN_PROGRESS' " +
           "ORDER BY ast.stepOrder ASC")
    List<ApprovalStep> findCurrentStepsByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 완료된 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE " +
           "ast.approvalLine.id = :approvalLineId AND " +
           "ast.status IN ('APPROVED', 'REJECTED') " +
           "ORDER BY ast.stepOrder ASC")
    List<ApprovalStep> findCompletedStepsByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 위임된 결재단계 조회
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.alternateApprover.id = :delegatedToId")
    List<ApprovalStep> findByDelegatedToId(@Param("delegatedToId") String delegatedToId);
    
    // 마감일 관련 필드는 현재 엔티티에서 지원하지 않음
    
    /**
     * 결재자별 대기 중인 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE ast.approver.id = :approverId AND ast.status = :status")
    long countByApproverIdAndStatus(@Param("approverId") String approverId, @Param("status") String status);
    
    /**
     * 결재선별 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId")
    long countByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 완료된 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE " +
           "ast.approvalLine.id = :approvalLineId AND " +
           "ast.status IN ('APPROVED', 'REJECTED')")
    long countCompletedStepsByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 필수 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId AND ast.isRequired = true")
    long countByApprovalLineIdAndIsRequiredTrue(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 필수 완료된 결재단계 수 조회
     */
    @Query("SELECT COUNT(ast) FROM ApprovalStep ast WHERE " +
           "ast.approvalLine.id = :approvalLineId AND " +
           "ast.isRequired = true AND " +
           "ast.status IN ('APPROVED', 'REJECTED')")
    long countCompletedRequiredStepsByApprovalLineId(@Param("approvalLineId") String approvalLineId);
    
    /**
     * 결재선별 결재단계 조회 (리스트)
     */
    @Query("SELECT ast FROM ApprovalStep ast WHERE ast.approvalLine.id = :approvalLineId")
    List<ApprovalStep> findByApprovalLineId(@Param("approvalLineId") String approvalLineId);
}

