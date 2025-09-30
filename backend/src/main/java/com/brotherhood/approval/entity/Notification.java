package com.brotherhood.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 알림 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "title", nullable = false)
    private String title;
    
    @Column(name = "message", columnDefinition = "TEXT", nullable = false)
    private String message;
    
    @Column(name = "type", nullable = false, length = 50)
    private String type;
    
    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private String priority = "NORMAL";
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "action_url")
    private String actionUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id")
    private Document document;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Notification Type Enum
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
    
    // Notification Priority Enum
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
