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
 * 결재 이력 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-18
 */
@Entity
@Table(name = "approval_histories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ApprovalHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "action", nullable = false, length = 20)
    private String action;
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "document_id", nullable = false, columnDefinition = "UUID")
    private UUID documentId;
    
    @Column(name = "approval_step_id", nullable = false, columnDefinition = "UUID")
    private UUID approvalStepId;
    
    @Column(name = "approver_id", nullable = false, columnDefinition = "UUID")
    private UUID approverId;
    
    @Column(name = "delegated_to", columnDefinition = "UUID")
    private UUID delegatedToId;
    
    @CreatedDate
    @Column(name = "action_at", nullable = false, updatable = false)
    private LocalDateTime actionAt;
    
    // Additional fields for DTO mapping (Lazy Loading 문제 해결용)
    @Transient
    private String documentTitle;
    
    @Transient
    private String approverName;
    
    @Transient
    private String approverDisplayName;
    
    @Transient
    private String delegatedToName;
    
    @Transient
    private String delegatedToDisplayName;
    
    
    // Approval Action Constants
    public static class Action {
        public static final String APPROVE = "APPROVE";
        public static final String REJECT = "REJECT";
        public static final String DELEGATE = "DELEGATE";
        public static final String RETURN = "RETURN";
        public static final String CANCEL = "CANCEL";
    }
}