package com.brotherhood.approval.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 결재 단계 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-18
 */
@Entity
@Table(name = "approval_steps")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class ApprovalStep {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approval_line_id", nullable = false)
    private ApprovalLine approvalLine;
    
    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approver_id", nullable = false)
    private User approver;
    
    @Column(name = "approver_type", nullable = false, length = 20)
    @Builder.Default
    private String approverType = "PERSON";
    
    @Column(name = "is_required", nullable = false)
    @Builder.Default
    private Boolean isRequired = true;
    
    @Column(name = "is_delegatable", nullable = false)
    @Builder.Default
    private Boolean isDelegatable = true;
    
    @Column(name = "max_delegation_level", nullable = false)
    @Builder.Default
    private Integer maxDelegationLevel = 1;
    
    @Column(name = "due_date")
    private LocalDate dueDate;
    
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "PENDING";
    
    @Column(name = "is_conditional", nullable = false)
    @Builder.Default
    private Boolean isConditional = false;
    
    @Column(name = "condition_expression", columnDefinition = "TEXT")
    private String conditionExpression;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "alternate_approver_id")
    private User alternateApprover;
    
    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(name = "delegated_at")
    private LocalDateTime delegatedAt;
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Helper methods
    public UUID getApprovalLineId() {
        return approvalLine != null ? approvalLine.getId() : null;
    }
    
    public UUID getApproverId() {
        return approver != null ? approver.getId() : null;
    }
    
    public UUID getAlternateApproverId() {
        return alternateApprover != null ? alternateApprover.getId() : null;
    }
    
    // Status Constants
    public static class Status {
        public static final String PENDING = "PENDING";
        public static final String APPROVED = "APPROVED";
        public static final String REJECTED = "REJECTED";
        public static final String DELEGATED = "DELEGATED";
        public static final String RETURNED = "RETURNED";
        public static final String CANCELLED = "CANCELLED";
    }
    
    // Approver Type Constants
    public static class ApproverType {
        public static final String PERSON = "PERSON";
        public static final String ROLE = "ROLE";
        public static final String BRANCH = "BRANCH";
    }
}