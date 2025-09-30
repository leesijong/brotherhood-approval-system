package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.user.UserDto;
import com.brotherhood.approval.dto.user.UserCreateRequest;
import com.brotherhood.approval.dto.user.UserUpdateRequest;
import com.brotherhood.approval.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 사용자 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "branchId", ignore = true)
    @Mapping(target = "branchName", ignore = true)
    @Mapping(target = "branchCode", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "displayName", ignore = true)
    UserDto toDto(User user);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<UserDto> toDtoList(List<User> users);
    
    /**
     * 생성 요청을 엔티티로 변환
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "approvalSteps", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "isActive", constant = "true")
    User toEntity(UserCreateRequest request);
    
    /**
     * 업데이트 요청으로 엔티티 업데이트
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "branch", ignore = true)
    @Mapping(target = "lastLoginAt", ignore = true)
    @Mapping(target = "userRoles", ignore = true)
    @Mapping(target = "documents", ignore = true)
    @Mapping(target = "approvalSteps", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "auditLogs", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UserUpdateRequest request, @MappingTarget User user);
}
