package com.brotherhood.approval.dto.document;

import com.brotherhood.approval.entity.Document;
import com.brotherhood.approval.dto.approval.ApprovalLineDto;
import com.brotherhood.approval.dto.comment.CommentDto;
import com.brotherhood.approval.dto.attachment.AttachmentDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 문서 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    
    private String id;
    private String title;
    private String content;
    private String status;
    private String documentType;
    private String securityLevel;
    private String priority;
    private String documentNumber;
    private Integer version;
    private Boolean isFinal;
    private String parentDocumentId;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime rejectedAt;
    private String rejectionReason;
    private LocalDateTime dueDate;
    private String authorId;
    private String authorName;
    private String authorDisplayName;
    private String branchId;
    private String branchName;
    private String branchCode;
    private List<ApprovalLineDto> approvalLines;
    private List<CommentDto> comments;
    private List<AttachmentDto> attachments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

