package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.approval.ApprovalHistoryDto;
import com.brotherhood.approval.entity.ApprovalHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 결재 이력 매퍼 (EAGER 로딩 사용)
 * 
 * @author Brotherhood Development Team
 * @version 3.0.0
 * @since 2024-09-29
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApprovalHistoryMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    ApprovalHistoryDto toDto(ApprovalHistory approvalHistory);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<ApprovalHistoryDto> toDtoList(List<ApprovalHistory> approvalHistories);
}
