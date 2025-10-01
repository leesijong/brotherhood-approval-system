package com.brotherhood.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 정책 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Entity
@Table(name = "policies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Policy {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "policy_type", nullable = false)
    private String policyType;
    
    @Column(name = "policy_data", columnDefinition = "TEXT", nullable = false)
    private String policyData;
    
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Policy Type Enum
    public enum PolicyType {
        APPROVAL_LINE("결재선"),
        ACCESS_CONTROL("접근제어"),
        RETENTION("보존기간"),
        NOTIFICATION("알림");
        
        private final String description;
        
        PolicyType(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
    
    // Policy Category Enum
    public enum PolicyCategory {
        SECURITY("보안"),
        WORKFLOW("업무흐름"),
        COMPLIANCE("규정준수"),
        SYSTEM("시스템");
        
        private final String description;
        
        PolicyCategory(String description) {
            this.description = description;
        }
        
        public String getDescription() {
            return description;
        }
    }
}

