package com.brotherhood.approval.dto.user;

import com.brotherhood.approval.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 사용자 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    
    private String id;
    private String name;
    private String loginId;
    private String email;
    private String baptismalName;
    private String phone;
    private Boolean isActive;
    private String branchId;
    private String branchName;
    private String branchCode;
    private List<String> roles;
    private String displayName;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

