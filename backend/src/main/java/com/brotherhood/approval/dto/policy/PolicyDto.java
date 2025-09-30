package com.brotherhood.approval.dto.policy;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 정책 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PolicyDto {
    
    private String id;
    private String name;
    private String description;
    private String policyType;
    private String policyData;
    private Boolean isActive;
    private String createdById;
    private String createdByName;
    private String branchId;
    private String branchName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
