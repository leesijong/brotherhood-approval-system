package com.brotherhood.approval.dto.notification;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 알림 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {
    
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationPriority priority;
    private Boolean isRead;
    private String userId;
    private String documentId;
    private String documentTitle;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    
    public enum NotificationType {
        DOCUMENT_SUBMITTED("문서 상신"),
        DOCUMENT_APPROVED("문서 승인"),
        DOCUMENT_REJECTED("문서 반려"),
        APPROVAL_REQUESTED("결재 요청"),
        APPROVAL_DELEGATED("결재 위임"),
        COMMENT_ADDED("댓글 추가"),
        ATTACHMENT_UPLOADED("첨부파일 업로드"),
        SYSTEM_ANNOUNCEMENT("시스템 공지");
        
        private final String description;
        
        NotificationType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    public enum NotificationPriority {
        LOW("낮음"),
        NORMAL("보통"),
        HIGH("높음"),
        URGENT("긴급");
        
        private final String description;
        
        NotificationPriority(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}
