package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.ApprovalHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 결재 이력 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, UUID> {
    
    /**
     * 문서별 결재 이력 조회
     */
    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.document.id = :documentId ORDER BY ah.actionAt DESC")
    List<ApprovalHistory> findByDocumentIdOrderByActionAtDesc(@Param("documentId") UUID documentId);
    
    /**
     * 결재단계별 결재 이력 조회
     */
    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.approvalStep.id = :approvalStepId ORDER BY ah.actionAt DESC")
    List<ApprovalHistory> findByApprovalStepIdOrderByActionAtDesc(@Param("approvalStepId") String approvalStepId);
    
    /**
     * 결재자별 결재 이력 조회
     */
    @Query("SELECT ah FROM ApprovalHistory ah WHERE ah.approver.id = :approverId ORDER BY ah.actionAt DESC")
    Page<ApprovalHistory> findByApproverIdOrderByActionAtDesc(@Param("approverId") UUID approverId, Pageable pageable);
    
    /**
     * 액션별 결재 이력 조회
     */
    List<ApprovalHistory> findByAction(String action);
    
    /**
     * 기간별 결재 이력 조회
     */
    @Query("SELECT ah FROM ApprovalHistory ah WHERE " +
           "ah.actionAt BETWEEN :startDate AND :endDate")
    Page<ApprovalHistory> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate,
                                         Pageable pageable);
    
    /**
     * 문서별 결재 이력 수 조회
     */
    @Query("SELECT COUNT(ah) FROM ApprovalHistory ah WHERE ah.document.id = :documentId")
    long countByDocumentId(@Param("documentId") UUID documentId);
    
    /**
     * 결재자별 결재 이력 수 조회
     */
    @Query("SELECT COUNT(ah) FROM ApprovalHistory ah WHERE ah.approver.id = :approverId")
    long countByApproverId(@Param("approverId") UUID approverId);
    
    /**
     * 액션별 결재 이력 수 조회
     */
    long countByAction(String action);
}
