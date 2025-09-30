package com.brotherhood.approval.dto.audit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 감사 로그 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogDto {
    
    private String id;
    private String action;
    private String resourceType;
    private String resourceId;
    private String oldValues;
    private String newValues;
    private String ipAddress;
    private String userAgent;
    private String userId;
    private String userName;
    private String userDisplayName;
    private LocalDateTime createdAt;
}
