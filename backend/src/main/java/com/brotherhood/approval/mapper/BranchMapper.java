package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.branch.BranchDto;
import com.brotherhood.approval.entity.Branch;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 지사 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BranchMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "parentId", ignore = true) // parent 필드가 제거됨
    @Mapping(target = "parentName", ignore = true) // parent 필드가 제거됨
    BranchDto toDto(Branch branch);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<BranchDto> toDtoList(List<Branch> branches);
}
