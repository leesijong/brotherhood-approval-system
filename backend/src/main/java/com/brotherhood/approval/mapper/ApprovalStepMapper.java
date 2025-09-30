package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.approval.ApprovalStepDto;
import com.brotherhood.approval.dto.approval.ApprovalStepCreateRequest;
import com.brotherhood.approval.entity.ApprovalStep;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

/**
 * 결재단계 매퍼
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ApprovalStepMapper {
    
    /**
     * 엔티티를 DTO로 변환
     */
    @Mapping(target = "approvalLineId", source = "approvalLine.id")
    @Mapping(target = "approverId", source = "approver.id")
    @Mapping(target = "approverName", source = "approver.fullName")
    @Mapping(target = "approverDisplayName", source = "approver.displayName")
    @Mapping(target = "delegatedToId", source = "alternateApprover.id")
    @Mapping(target = "delegatedToName", source = "alternateApprover.fullName")
    @Mapping(target = "delegatedToDisplayName", source = "alternateApprover.displayName")
    @Mapping(target = "status", source = "status")
    @Mapping(target = "isRequired", source = "isRequired")
    @Mapping(target = "isDelegatable", source = "isDelegatable")
    @Mapping(target = "maxDelegationLevel", source = "maxDelegationLevel")
    @Mapping(target = "updatedAt", ignore = true)
    ApprovalStepDto toDto(ApprovalStep approvalStep);
    
    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    List<ApprovalStepDto> toDtoList(List<ApprovalStep> approvalSteps);
    
    /**
     * 생성 요청을 엔티티로 변환
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "approverType", constant = "PERSON")
    @Mapping(target = "isRequired", constant = "true")
    @Mapping(target = "isDelegatable", constant = "true")
    @Mapping(target = "maxDelegationLevel", constant = "1")
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isConditional", ignore = true)
    @Mapping(target = "conditionExpression", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "delegatedAt", ignore = true)
    @Mapping(target = "approvalLine", ignore = true)
    @Mapping(target = "approver", ignore = true)
    @Mapping(target = "alternateApprover", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ApprovalStep toEntity(ApprovalStepCreateRequest request);
    
    /**
     * 생성 요청으로 엔티티 업데이트
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "approverType", ignore = true)
    @Mapping(target = "isDelegatable", ignore = true)
    @Mapping(target = "maxDelegationLevel", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "isConditional", ignore = true)
    @Mapping(target = "conditionExpression", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "approvedAt", ignore = true)
    @Mapping(target = "rejectedAt", ignore = true)
    @Mapping(target = "delegatedAt", ignore = true)
    @Mapping(target = "approvalLine", ignore = true)
    @Mapping(target = "approver", ignore = true)
    @Mapping(target = "alternateApprover", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    void updateEntity(ApprovalStepCreateRequest request, @MappingTarget ApprovalStep approvalStep);
}
