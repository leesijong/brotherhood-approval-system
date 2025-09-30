package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.audit.AuditLogDto;
import com.brotherhood.approval.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 감사 로그 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AuditLogMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.fullName") // TODO: User 서비스에서 조회 필요
    @Mapping(target = "userDisplayName", source = "user.displayName") // TODO: User 서비스에서 조회 필요
    AuditLogDto toDto(AuditLog auditLog);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<AuditLogDto> toDtoList(List<AuditLog> auditLogs);
}
