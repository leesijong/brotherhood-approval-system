package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalStep;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 결재단계 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepDto {
    
    private String id;
    private Integer stepOrder;
    private String approverType;
    private String status;
    private Boolean isRequired;
    private Boolean isDelegatable;
    private Integer maxDelegationLevel;
    private String approvalLineId;
    private String approverId;
    private String approverName;
    private String approverDisplayName;
    private String delegatedToId;
    private String delegatedToName;
    private String delegatedToDisplayName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

