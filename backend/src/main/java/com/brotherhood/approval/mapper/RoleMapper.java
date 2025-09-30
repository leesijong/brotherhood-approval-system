package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.role.RoleDto;
import com.brotherhood.approval.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 역할 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RoleMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    RoleDto toDto(Role role);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<RoleDto> toDtoList(List<Role> roles);
}
