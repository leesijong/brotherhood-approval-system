package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * 문서 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    
    /**
     * 문서번호로 조회
     */
    Optional<Document> findByDocumentNumber(String documentNumber);
    
    /**
     * 작성자별 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.author.id = :authorId")
    Page<Document> findByAuthorId(@Param("authorId") UUID authorId, Pageable pageable);
    
    /**
     * 지사별 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.branch.id = :branchId")
    Page<Document> findByBranchId(@Param("branchId") UUID branchId, Pageable pageable);
    
    /**
     * 상태별 문서 조회
     */
    Page<Document> findByStatus(String status, Pageable pageable);
    
    /**
     * 문서 유형별 조회
     */
    Page<Document> findByDocumentType(String documentType, Pageable pageable);
    
    /**
     * 보안 등급별 문서 조회
     */
    Page<Document> findBySecurityLevel(String securityLevel, Pageable pageable);
    
    /**
     * 우선순위별 문서 조회
     */
    Page<Document> findByPriority(String priority, Pageable pageable);
    
    /**
     * 작성자별 상태별 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.author.id = :authorId AND d.status = :status")
    Page<Document> findByAuthorIdAndStatus(@Param("authorId") UUID authorId, @Param("status") String status, Pageable pageable);
    
    /**
     * 지사별 상태별 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.branch.id = :branchId AND d.status = :status")
    Page<Document> findByBranchIdAndStatus(@Param("branchId") UUID branchId, @Param("status") String status, Pageable pageable);
    
    /**
     * 문서 검색 (제목, 내용)
     */
    @Query("SELECT d FROM Document d WHERE " +
           "(d.title LIKE %:keyword% OR d.content LIKE %:keyword%) AND " +
           "d.branch.id = :branchId")
    Page<Document> findByKeywordAndBranchId(@Param("keyword") String keyword, 
                                           @Param("branchId") UUID branchId, 
                                           Pageable pageable);
    
    /**
     * 결재 참여자별 문서 조회
     */
    @Query("SELECT DISTINCT d FROM Document d " +
           "JOIN d.approvalLines al " +
           "JOIN al.approvalSteps ast " +
           "WHERE ast.approver.id = :userId")
    Page<Document> findByApproverId(@Param("userId") String userId, Pageable pageable);
    
    /**
     * 결재 대기 문서 조회
     * - 결재선이 존재하고, 해당 사용자가 결재해야 하는 문서만 조회
     * - 결재선이 없는 문서는 제외
     */
    @Query("SELECT d FROM Document d " +
           "WHERE d.id IN (" +
           "  SELECT DISTINCT d2.id FROM Document d2 " +
           "  INNER JOIN d2.approvalLines al " +
           "  INNER JOIN al.approvalSteps ast " +
           "  WHERE ast.approver.id = :userId " +
           "  AND ast.status = 'PENDING' " +
           "  AND d2.status IN ('PENDING', 'SUBMITTED')" +
           ")")
    Page<Document> findPendingApprovalByUserId(@Param("userId") UUID userId, Pageable pageable);
    
    /**
     * 기간별 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE " +
           "d.createdAt BETWEEN :startDate AND :endDate AND " +
           "d.branch.id = :branchId")
    Page<Document> findByDateRangeAndBranchId(@Param("startDate") LocalDateTime startDate,
                                             @Param("endDate") LocalDateTime endDate,
                                             @Param("branchId") UUID branchId,
                                             Pageable pageable);
    
    /**
     * 문서번호 중복 확인
     */
    boolean existsByDocumentNumber(String documentNumber);
    
    /**
     * 지사별 문서 수 조회
     */
    @Query("SELECT COUNT(d) FROM Document d WHERE d.branch.id = :branchId")
    long countByBranchId(@Param("branchId") UUID branchId);
    
    /**
     * 상태별 문서 수 조회
     */
    long countByStatus(String status);
    
    /**
     * 작성자별 문서 수 조회
     */
    @Query("SELECT COUNT(d) FROM Document d WHERE d.author.id = :authorId")
    long countByAuthorId(@Param("authorId") UUID authorId);
    
    /**
     * 작성자별 상태별 문서 수 조회
     */
    @Query("SELECT COUNT(d) FROM Document d WHERE d.author.id = :authorId AND d.status = :status")
    long countByAuthorIdAndStatus(@Param("authorId") UUID authorId, @Param("status") String status);
    
    /**
     * 작성자별 최근 문서 조회 (생성일 기준 내림차순)
     */
    @Query("SELECT d FROM Document d WHERE d.author.id = :authorId ORDER BY d.createdAt DESC")
    Page<Document> findByAuthorIdOrderByCreatedAtDesc(@Param("authorId") UUID authorId, Pageable pageable);
    
    /**
     * 최근 문서 조회 (지사별)
     */
    @Query("SELECT d FROM Document d WHERE d.branch.id = :branchId " +
           "ORDER BY d.createdAt DESC")
    List<Document> findRecentDocumentsByBranchId(@Param("branchId") UUID branchId, Pageable pageable);
    
    /**
     * 최근 10개 문서 조회
     */
    List<Document> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * 긴급 문서 수 조회 (우선순위가 URGENT인 문서)
     */
    long countByPriority(String priority);
    
    /**
     * 지사별 상태별 문서 수 조회
     */
    @Query("SELECT COUNT(d) FROM Document d WHERE d.branch.id = :branchId AND d.status = :status")
    long countByBranchIdAndStatus(@Param("branchId") UUID branchId, @Param("status") String status);
    
    /**
     * 긴급 문서 조회 (리스트)
     */
    List<Document> findByPriority(String priority);
    
    /**
     * 상태별 긴급 문서 조회
     */
    List<Document> findByStatusAndPriority(String status, String priority);
    
    /**
     * 작성자별 긴급 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.author.id = :authorId AND d.priority = :priority")
    List<Document> findByAuthorIdAndPriority(@Param("authorId") UUID authorId, @Param("priority") String priority);
    
    /**
     * 지사별 긴급 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE d.branch.id = :branchId AND d.priority = :priority")
    List<Document> findByBranchIdAndPriority(@Param("branchId") UUID branchId, @Param("priority") String priority);
    
    /**
     * 기간별 긴급 문서 조회
     */
    @Query("SELECT d FROM Document d WHERE " +
           "d.priority = :priority AND " +
           "d.createdAt BETWEEN :startDate AND :endDate")
    List<Document> findUrgentDocumentsByDateRange(@Param("priority") String priority,
                                                  @Param("startDate") LocalDateTime startDate,
                                                  @Param("endDate") LocalDateTime endDate);
}

