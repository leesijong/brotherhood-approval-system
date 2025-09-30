package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.policy.PolicyDto;
import com.brotherhood.approval.entity.Policy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 정책 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PolicyMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "createdById", source = "createdBy.id")
    @Mapping(target = "createdByName", source = "createdBy.fullName")
    @Mapping(target = "branchId", ignore = true) // branch 필드가 제거됨
    @Mapping(target = "branchName", ignore = true) // branch 필드가 제거됨
    PolicyDto toDto(Policy policy);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<PolicyDto> toDtoList(List<Policy> policies);
}
