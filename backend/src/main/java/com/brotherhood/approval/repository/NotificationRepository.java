package com.brotherhood.approval.repository;

import com.brotherhood.approval.entity.Notification;
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
 * 알림 리포지토리
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    
    /**
     * 사용자별 알림 조회 (페이지네이션)
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    Page<Notification> findByUserIdOrderByCreatedAtDesc(@Param("userId") String userId, Pageable pageable);
    
    /**
     * 사용자별 읽지 않은 알림 조회
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(@Param("userId") String userId);
    
    /**
     * 사용자별 알림 조회 (최근 N개)
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC LIMIT 10")
    List<Notification> findTop10ByUserIdOrderByCreatedAtDesc(@Param("userId") String userId);
    
    /**
     * 알림 타입별 조회
     */
    @Query("SELECT n FROM Notification n WHERE n.type = :type AND n.user.id = :userId ORDER BY n.createdAt DESC")
    List<Notification> findByTypeAndUserIdOrderByCreatedAtDesc(@Param("type") String type, @Param("userId") String userId);
    
    /**
     * 특정 기간 알림 조회
     */
    @Query("SELECT n FROM Notification n WHERE n.user.id = :userId AND n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<Notification> findByUserIdAndDateRange(@Param("userId") String userId, 
                                               @Param("startDate") LocalDateTime startDate, 
                                               @Param("endDate") LocalDateTime endDate);
    
    /**
     * 읽지 않은 알림을 읽음으로 표시
     */
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadByUserId(@Param("userId") String userId);
    
    /**
     * 특정 알림을 읽음으로 표시
     */
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.id = :id")
    void markAsReadById(@Param("id") String id);
    
    /**
     * 오래된 알림 삭제 (30일 이상)
     */
    @Query("DELETE FROM Notification n WHERE n.createdAt < :cutoffDate")
    void deleteOldNotifications(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * 특정 날짜 이전 알림 조회
     */
    List<Notification> findByCreatedAtBefore(LocalDateTime cutoffDate);
    
    /**
     * 사용자별 알림 수 조회
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId")
    long countByUserId(@Param("userId") String userId);
    
    /**
     * 사용자별 읽지 않은 알림 수 조회
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = false")
    long countByUserIdAndIsReadFalse(@Param("userId") String userId);
    
    /**
     * 사용자별 읽은 알림 수 조회
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.isRead = true")
    long countByUserIdAndIsReadTrue(@Param("userId") String userId);
    
    /**
     * 알림 타입별 수 조회
     */
    long countByType(String type);
    
    /**
     * 사용자별 알림 타입별 수 조회
     */
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = :userId AND n.type = :type")
    long countByUserIdAndType(@Param("userId") String userId, @Param("type") String type);
}
