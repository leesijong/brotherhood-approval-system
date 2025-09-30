package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.AuditLog;
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
 * 감사로그 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    
    /**
     * 사용자별 감사로그 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE al.user.id = :userId ORDER BY al.actionAt DESC")
    Page<AuditLog> findByUserIdOrderByActionAtDesc(@Param("userId") String userId, Pageable pageable);
    
    /**
     * 사용자별 감사로그 조회 (리스트)
     */
    @Query("SELECT al FROM AuditLog al WHERE al.user.id = :userId ORDER BY al.actionAt DESC")
    List<AuditLog> findByUserIdOrderByActionAtDesc(@Param("userId") String userId);
    
    /**
     * 액션별 감사로그 조회
     */
    Page<AuditLog> findByActionOrderByActionAtDesc(String action, Pageable pageable);
    
    /**
     * 액션별 감사로그 조회 (리스트)
     */
    List<AuditLog> findByActionOrderByActionAtDesc(String action);
    
    /**
     * 리소스별 감사로그 조회
     */
    Page<AuditLog> findByResourceTypeAndResourceIdOrderByActionAtDesc(String resourceType, 
                                                                      UUID resourceId, 
                                                                      Pageable pageable);
    
    /**
     * 리소스별 감사로그 조회 (리스트)
     */
    List<AuditLog> findByResourceTypeAndResourceIdOrderByActionAtDesc(String resourceType, UUID resourceId);
    
    /**
     * IP 주소별 감사로그 조회
     */
    Page<AuditLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress, Pageable pageable);
    
    // 세션별, 성공/실패별 감사로그 조회는 현재 엔티티에서 지원하지 않음
    
    /**
     * 기간별 감사로그 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "al.actionAt BETWEEN :startDate AND :endDate " +
           "ORDER BY al.actionAt DESC")
    Page<AuditLog> findByActionAtBetweenOrderByActionAtDesc(@Param("startDate") LocalDateTime startDate,
                                                           @Param("endDate") LocalDateTime endDate,
                                                           Pageable pageable);
    
    /**
     * 기간별 감사로그 조회 (리스트)
     */
    List<AuditLog> findByActionAtBetweenOrderByActionAtDesc(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * 사용자별 기간별 감사로그 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "al.user.id = :userId AND " +
           "al.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY al.createdAt DESC")
    Page<AuditLog> findByUserIdAndDateRange(@Param("userId") String userId,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate,
                                           Pageable pageable);
    
    /**
     * 액션별 기간별 감사로그 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "al.action = :action AND " +
           "al.createdAt BETWEEN :startDate AND :endDate " +
           "ORDER BY al.createdAt DESC")
    Page<AuditLog> findByActionAndDateRange(@Param("action") String action,
                                           @Param("startDate") LocalDateTime startDate,
                                           @Param("endDate") LocalDateTime endDate,
                                           Pageable pageable);
    
    /**
     * 감사로그 검색 (액션, 리소스 타입)
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "(al.action LIKE %:keyword% OR al.resourceType LIKE %:keyword%) " +
           "ORDER BY al.createdAt DESC")
    Page<AuditLog> findByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    /**
     * 사용자별 감사로그 수 조회
     */
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE al.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
    
    /**
     * 액션별 감사로그 수 조회
     */
    long countByAction(String action);
    
    // 성공/실패별 감사로그 수 조회는 현재 엔티티에서 지원하지 않음
    
    /**
     * 기간별 감사로그 수 조회
     */
    @Query("SELECT COUNT(al) FROM AuditLog al WHERE " +
           "al.createdAt BETWEEN :startDate AND :endDate")
    long countByDateRange(@Param("startDate") LocalDateTime startDate,
                         @Param("endDate") LocalDateTime endDate);
    
    /**
     * 사용자별 최근 로그인 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "al.user.id = :userId AND " +
           "al.action = 'LOGIN' " +
           "ORDER BY al.createdAt DESC")
    List<AuditLog> findRecentLoginsByUserId(@Param("userId") String userId, Pageable pageable);
    
    /**
     * 리소스별 접근 이력 조회
     */
    @Query("SELECT al FROM AuditLog al WHERE " +
           "al.resourceType = :resourceType AND " +
           "al.resourceId = :resourceId AND " +
           "al.action IN ('DOCUMENT_VIEWED', 'DOCUMENT_DOWNLOADED') " +
           "ORDER BY al.createdAt DESC")
    List<AuditLog> findResourceAccessHistory(@Param("resourceType") String resourceType,
                                           @Param("resourceId") String resourceId,
                                           Pageable pageable);
    
    
    /**
     * 최근 10개 감사로그 조회
     */
    List<AuditLog> findTop10ByOrderByCreatedAtDesc();
    
    /**
     * 특정 날짜 이전 감사로그 조회
     */
    List<AuditLog> findByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * 사용자별 감사로그 삭제
     */
    @Query("DELETE FROM AuditLog al WHERE al.user.id = :userId")
    void deleteByUserId(@Param("userId") String userId);
    
    /**
     * 리소스별 감사로그 삭제
     */
    @Query("DELETE FROM AuditLog al WHERE al.resourceType = :resourceType AND al.resourceId = :resourceId")
    void deleteByResourceTypeAndResourceId(@Param("resourceType") String resourceType, @Param("resourceId") UUID resourceId);
    
    /**
     * 기간별 감사로그 삭제
     */
    @Query("DELETE FROM AuditLog al WHERE al.actionAt BETWEEN :startDate AND :endDate")
    void deleteByActionAtBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    /**
     * 리소스별 감사로그 수 조회
     */
    long countByResourceTypeAndResourceId(String resourceType, UUID resourceId);
    
    /**
     * 기간별 감사로그 수 조회
     */
    long countByActionAtBetween(LocalDateTime startDate, LocalDateTime endDate);
}

