package com.brotherhood.approval.dto.branch;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 지사 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BranchDto {
    
    private UUID id;
    private String name;
    private String code;
    private String address;
    private String phone;
    private String email;
    private UUID parentId;
    private String parentName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
