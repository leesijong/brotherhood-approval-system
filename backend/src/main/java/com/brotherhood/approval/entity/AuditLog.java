package com.brotherhood.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 감사로그 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-18
 */
@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "action", nullable = false, length = 50)
    private String action;
    
    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;
    
    @Column(name = "resource_id", nullable = false)
    private UUID resourceId;
    
    @Column(name = "old_values", columnDefinition = "TEXT")
    private String oldValues;
    
    @Column(name = "new_values", columnDefinition = "TEXT")
    private String newValues;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "session_id", length = 255)
    private String sessionId;
    
    @Column(name = "is_successful")
    private Boolean isSuccessful;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "action_at", nullable = false)
    private LocalDateTime actionAt;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Helper methods
    public UUID getUserId() {
        return user != null ? user.getId() : null;
    }
}