package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalHistory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 결재 이력 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalHistoryDto {
    
    private String id;
    private String action;
    private String comment;
    private String ipAddress;
    private String userAgent;
    private String documentId;
    private String documentTitle;
    private String approvalStepId;
    private String approverId;
    private String approverName;
    private String approverDisplayName;
    private String delegatedToId;
    private String delegatedToName;
    private String delegatedToDisplayName;
    private LocalDateTime actionAt;
}
