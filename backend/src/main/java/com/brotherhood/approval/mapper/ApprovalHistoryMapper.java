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
    @Mapping(target = "documentId", source = "document.id")
    @Mapping(target = "documentTitle", source = "document.title")
    @Mapping(target = "approvalStepId", source = "approvalStep.id")
    @Mapping(target = "approverId", source = "approver.id")
    @Mapping(target = "approverName", source = "approver.fullName")
    @Mapping(target = "approverDisplayName", source = "approver.displayName")
    @Mapping(target = "delegatedToId", source = "delegatedTo.id")
    @Mapping(target = "delegatedToName", source = "delegatedTo.fullName")
    @Mapping(target = "delegatedToDisplayName", source = "delegatedTo.displayName")
    ApprovalHistoryDto toDto(ApprovalHistory approvalHistory);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<ApprovalHistoryDto> toDtoList(List<ApprovalHistory> approvalHistories);
}
