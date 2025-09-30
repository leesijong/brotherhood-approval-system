package com.brotherhood.approval.mapper;

import com.brotherhood.approval.dto.approval.ApprovalLineDto;
import com.brotherhood.approval.dto.approval.ApprovalLineCreateRequest;
import com.brotherhood.approval.entity.ApprovalLine;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 결재선 매퍼 (Lazy Loading 문제 해결을 위해 수동 구현)
 * 
 * @author Brotherhood Development Team
 * @version 2.0.0
 * @since 2024-09-29
 */
@Component
public class ApprovalLineMapper {

    /**
     * 엔티티를 DTO로 변환
     */
    public ApprovalLineDto toDto(ApprovalLine approvalLine) {
        if (approvalLine == null) {
            return null;
        }

        return ApprovalLineDto.builder()
                .id(approvalLine.getId() != null ? approvalLine.getId().toString() : null)
                .name(approvalLine.getName())
                .description(approvalLine.getDescription())
                .isParallel(approvalLine.getIsParallel())
                .isConditional(approvalLine.getIsConditional())
                .conditionExpression(approvalLine.getConditionExpression())
                .createdById(approvalLine.getCreatedBy() != null ? approvalLine.getCreatedBy().getId().toString() : null)
                .createdByName(approvalLine.getCreatedBy() != null ? approvalLine.getCreatedBy().getFullName() : null)
                .documentId(approvalLine.getDocument() != null ? approvalLine.getDocument().getId().toString() : null)
                .approvalSteps(null) // Lazy Loading 문제 해결을 위해 null
                .createdAt(approvalLine.getCreatedAt())
                .updatedAt(approvalLine.getUpdatedAt())
                .build();
    }

    /**
     * 엔티티 리스트를 DTO 리스트로 변환
     */
    public List<ApprovalLineDto> toDtoList(List<ApprovalLine> approvalLines) {
        if (approvalLines == null) {
            return null;
        }

        return approvalLines.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * 생성 요청을 엔티티로 변환
     */
    public ApprovalLine toEntity(ApprovalLineCreateRequest request) {
        if (request == null) {
            return null;
        }

        return ApprovalLine.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isParallel(false)
                .isConditional(false)
                .conditionExpression(null)
                .build();
    }

    /**
     * 생성 요청으로 엔티티 업데이트
     */
    public void updateEntity(ApprovalLineCreateRequest request, ApprovalLine approvalLine) {
        if (request == null || approvalLine == null) {
            return;
        }

        approvalLine.setName(request.getName());
        approvalLine.setDescription(request.getDescription());
    }
}
