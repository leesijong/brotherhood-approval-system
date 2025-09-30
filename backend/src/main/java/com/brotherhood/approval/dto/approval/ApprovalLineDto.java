package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalLine;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 결재선 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLineDto {
    
    private String id;
    private String name;
    private String description;
    private Boolean isParallel;
    private Boolean isConditional;
    private String conditionExpression;
    private String createdById;
    private String createdByName;
    private String documentId;
    private List<ApprovalStepDto> approvalSteps;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

