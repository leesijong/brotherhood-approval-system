package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalLine;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 결재선 생성 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalLineCreateRequest {
    
    @NotNull(message = "결재선 유형은 필수입니다")
    private ApprovalLine.ApprovalLineType type;
    
    @NotBlank(message = "결재선 이름은 필수입니다")
    @Size(max = 100, message = "결재선 이름은 100자를 초과할 수 없습니다")
    private String name;
    
    @Size(max = 500, message = "결재선 설명은 500자를 초과할 수 없습니다")
    private String description;
    
    @NotNull(message = "결재단계는 필수입니다")
    private List<ApprovalStepCreateRequest> approvalSteps;
    
    @NotBlank(message = "문서 ID는 필수입니다")
    private String documentId;
    
    // Getter 메서드들 추가
    public String getDocumentId() {
        return documentId;
    }
    
    public String getName() {
        return name;
    }
    
    public ApprovalLine.ApprovalLineType getType() {
        return type;
    }
    
    public String getDescription() {
        return description;
    }
    
    public List<ApprovalStepCreateRequest> getApprovalSteps() {
        return approvalSteps;
    }
}

