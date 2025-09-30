package com.brotherhood.approval.dto.document;

import com.brotherhood.approval.dto.approval.ApprovalLineCreateRequest;
import com.brotherhood.approval.entity.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 문서 생성 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentCreateRequest {
    
    @NotBlank(message = "문서 제목은 필수입니다")
    @Size(max = 200, message = "문서 제목은 200자를 초과할 수 없습니다")
    private String title;
    
    @Size(max = 10000, message = "문서 내용은 10000자를 초과할 수 없습니다")
    private String content;
    
    @NotNull(message = "문서 분류는 필수입니다")
    private String classification;
    
    private Boolean isUrgent;
    private String dueDate;
    
    // branchId는 작성자의 지사로 자동 설정되므로 선택적
    private String branchId;
    
    private List<ApprovalLineCreateRequest> approvalLines;
    private List<String> attachmentIds;
}

