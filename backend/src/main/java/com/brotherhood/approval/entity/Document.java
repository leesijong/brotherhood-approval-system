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
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

/**
 * 문서 엔티티
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-18
 */
@Entity
@Table(name = "documents")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Document {
    
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "title", nullable = false, length = 200)
    private String title;
    
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;
    
    @Column(name = "document_type", nullable = false, length = 50)
    private String documentType;
    
    @Column(name = "security_level", nullable = false, length = 20)
    @Builder.Default
    private String securityLevel = "GENERAL";
    
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "DRAFT";
    
    @Column(name = "priority", nullable = false, length = 20)
    @Builder.Default
    private String priority = "NORMAL";
    
    @Column(name = "document_number", unique = true, length = 50)
    private String documentNumber;
    
    @Column(name = "version", nullable = false)
    @Builder.Default
    private Integer version = 1;
    
    @Column(name = "is_final", nullable = false)
    @Builder.Default
    private Boolean isFinal = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_document_id")
    private Document parentDocument;
    
    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
    
    @Column(name = "approved_at")
    private LocalDateTime approvedAt;
    
    @Column(name = "rejected_at")
    private LocalDateTime rejectedAt;
    
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
    
    @Column(name = "due_date")
    private LocalDateTime dueDate;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branch_id", nullable = false)
    private Branch branch;
    
    @OneToMany(mappedBy = "document", cascade = {}, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<ApprovalLine> approvalLines = new HashSet<>();
    
    @OneToMany(mappedBy = "document", cascade = {}, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Comment> comments = new HashSet<>();
    
    @OneToMany(mappedBy = "document", cascade = {}, fetch = FetchType.LAZY)
    @Builder.Default
    private Set<Attachment> attachments = new HashSet<>();
    
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Helper methods
    public UUID getAuthorId() {
        return author != null ? author.getId() : null;
    }
    
    public UUID getBranchId() {
        return branch != null ? branch.getId() : null;
    }
    
    public UUID getParentDocumentId() {
        return parentDocument != null ? parentDocument.getId() : null;
    }
    
    // Document Status Constants
    public static class Status {
        public static final String DRAFT = "DRAFT";
        public static final String PENDING = "PENDING";
        public static final String APPROVED = "APPROVED";
        public static final String REJECTED = "REJECTED";
        public static final String CANCELLED = "CANCELLED";
    }
    
    // Document Type Constants
    public static class Type {
        public static final String GENERAL = "GENERAL";
        public static final String BUDGET = "BUDGET";
        public static final String HR = "HR";
        public static final String SECURITY = "SECURITY";
        public static final String ADMINISTRATIVE = "ADMINISTRATIVE";
        public static final String FINANCIAL = "FINANCIAL";
    }
    
    // Security Level Constants
    public static class SecurityLevel {
        public static final String GENERAL = "GENERAL";
        public static final String CONFIDENTIAL = "CONFIDENTIAL";
        public static final String SECRET = "SECRET";
        public static final String TOP_SECRET = "TOP_SECRET";
    }
    
    // Priority Constants
    public static class Priority {
        public static final String LOW = "LOW";
        public static final String NORMAL = "NORMAL";
        public static final String HIGH = "HIGH";
        public static final String URGENT = "URGENT";
    }
}