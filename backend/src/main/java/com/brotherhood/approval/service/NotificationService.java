package com.brotherhood.approval.service;

import com.brotherhood.approval.dto.notification.NotificationDto;
import com.brotherhood.approval.entity.Notification;
import com.brotherhood.approval.entity.User;
import com.brotherhood.approval.mapper.CommonMapper;
import com.brotherhood.approval.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * 알림 서비스
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final CommonMapper commonMapper;
    
    /**
     * 알림 전송 (간단한 버전)
     */
    @Transactional
    public void sendNotification(String userId, String title, String message, String type) {
        log.info("알림 전송: {} - {}", type, userId);
        
        // 실제 구현에서는 사용자 조회 후 알림 생성
        // 여기서는 로그만 출력
        log.info("알림 전송 완료: {} - {} - {}", userId, title, message);
    }
    
    /**
     * 알림 생성
     */
    @Transactional
    public NotificationDto createNotification(String title, String message, 
                                            String type, 
                                            String priority,
                                            User user, String actionUrl) {
        log.info("알림 생성: {} - {}", type, user.getName());
        
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .priority(priority)
                .isRead(false)
                .user(user)
                .actionUrl(actionUrl)
                .build();
        
        Notification savedNotification = notificationRepository.save(notification);
        return commonMapper.toNotificationDto(savedNotification);
    }
    
    /**
     * 문서 관련 알림 생성
     */
    @Transactional
    public NotificationDto createDocumentNotification(String type, 
                                                    String documentTitle, User user) {
        String title = getNotificationTitle(type);
        String message = getNotificationMessage(type, documentTitle);
        String actionUrl = "/documents/" + user.getId(); // 실제 문서 ID로 수정 필요
        
        return createNotification(title, message, type, "NORMAL", user, actionUrl);
    }
    
    /**
     * 결재 관련 알림 생성
     */
    @Transactional
    public NotificationDto createApprovalNotification(String type, 
                                                    String documentTitle, User user) {
        String title = getNotificationTitle(type);
        String message = getNotificationMessage(type, documentTitle);
        String actionUrl = "/approvals/" + user.getId(); // 실제 결재 ID로 수정 필요
        
        return createNotification(title, message, type, "HIGH", user, actionUrl);
    }
    
    /**
     * 시스템 공지 알림 생성
     */
    @Transactional
    public NotificationDto createSystemNotification(String title, String message, User user) {
        return createNotification(title, message, 
                "SYSTEM_ANNOUNCEMENT", 
                "NORMAL", user, null);
    }
    
    /**
     * 사용자별 알림 조회
     */
    public Page<NotificationDto> getNotificationsByUser(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(commonMapper::toNotificationDto);
    }
    
    /**
     * 읽지 않은 알림 조회
     */
    public List<NotificationDto> getUnreadNotifications(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(commonMapper::toNotificationDto)
                .toList();
    }
    
    /**
     * 알림 읽음 처리
     */
    @Transactional
    public NotificationDto markAsRead(String notificationId, String userId) {
        log.info("알림 읽음 처리: {} - {}", notificationId, userId);
        
        Notification notification = notificationRepository.findById(UUID.fromString(notificationId))
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));
        
        // 권한 확인
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("알림을 읽을 권한이 없습니다");
        }
        
        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        
        Notification savedNotification = notificationRepository.save(notification);
        return commonMapper.toNotificationDto(savedNotification);
    }
    
    /**
     * 모든 알림 읽음 처리
     */
    @Transactional
    public void markAllAsRead(String userId) {
        log.info("모든 알림 읽음 처리: {}", userId);
        
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }
    
    /**
     * 알림 삭제
     */
    @Transactional
    public void deleteNotification(String notificationId, String userId) {
        log.info("알림 삭제: {} - {}", notificationId, userId);
        
        Notification notification = notificationRepository.findById(UUID.fromString(notificationId))
                .orElseThrow(() -> new IllegalArgumentException("알림을 찾을 수 없습니다: " + notificationId));
        
        // 권한 확인
        if (!notification.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("알림을 삭제할 권한이 없습니다");
        }
        
        notificationRepository.delete(notification);
    }
    
    /**
     * 오래된 알림 정리
     */
    @Transactional
    public void cleanupOldNotifications(int daysToKeep) {
        log.info("오래된 알림 정리 시작: {} 일 이상", daysToKeep);
        
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        List<Notification> oldNotifications = notificationRepository.findByCreatedAtBefore(cutoffDate);
        
        notificationRepository.deleteAll(oldNotifications);
        log.info("오래된 알림 정리 완료: {} 개 삭제", oldNotifications.size());
    }
    
    /**
     * 알림 통계 조회
     */
    public long getNotificationCount(String userId) {
        return notificationRepository.countByUserId(userId);
    }
    
    /**
     * 읽지 않은 알림 수 조회
     */
    public long getUnreadNotificationCount(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }
    
    /**
     * 알림 제목 생성
     */
    private String getNotificationTitle(String type) {
        return switch (type) {
            case "DOCUMENT_SUBMITTED" -> "문서 상신 알림";
            case "DOCUMENT_APPROVED" -> "문서 승인 알림";
            case "DOCUMENT_REJECTED" -> "문서 반려 알림";
            case "APPROVAL_REQUESTED" -> "결재 요청 알림";
            case "APPROVAL_DELEGATED" -> "결재 위임 알림";
            case "COMMENT_ADDED" -> "댓글 추가 알림";
            case "ATTACHMENT_UPLOADED" -> "첨부파일 업로드 알림";
            case "SYSTEM_ANNOUNCEMENT" -> "시스템 공지";
            default -> "알림";
        };
    }
    
    /**
     * 알림 메시지 생성
     */
    private String getNotificationMessage(String type, String documentTitle) {
        return switch (type) {
            case "DOCUMENT_SUBMITTED" -> "문서 '" + documentTitle + "'이 상신되었습니다.";
            case "DOCUMENT_APPROVED" -> "문서 '" + documentTitle + "'이 승인되었습니다.";
            case "DOCUMENT_REJECTED" -> "문서 '" + documentTitle + "'이 반려되었습니다.";
            case "APPROVAL_REQUESTED" -> "문서 '" + documentTitle + "'의 결재가 요청되었습니다.";
            case "APPROVAL_DELEGATED" -> "문서 '" + documentTitle + "'의 결재가 위임되었습니다.";
            case "COMMENT_ADDED" -> "문서 '" + documentTitle + "'에 댓글이 추가되었습니다.";
            case "ATTACHMENT_UPLOADED" -> "문서 '" + documentTitle + "'에 첨부파일이 업로드되었습니다.";
            case "SYSTEM_ANNOUNCEMENT" -> documentTitle;
            default -> "알림 메시지";
        };
    }
}
