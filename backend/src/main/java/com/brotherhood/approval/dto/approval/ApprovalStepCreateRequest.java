package com.brotherhood.approval.dto.approval;

import com.brotherhood.approval.entity.ApprovalStep;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * 결재단계 생성 요청 DTO
 * 
 * @author Brotherhood Development Team
 * @version 1.0.0
 * @since 2024-09-17
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalStepCreateRequest {
    
    @NotNull(message = "단계 순서는 필수입니다")
    private Integer stepOrder;
    
    @NotNull(message = "단계 유형은 필수입니다")
    private String stepType;
    
    @NotNull(message = "결재자 ID는 필수입니다")
    private String approverId;
    
    @NotNull(message = "결재선 ID는 필수입니다")
    private String approvalLineId;
    
    private String delegatedToId;
    private LocalDate dueDate;
    private Boolean isRequired;
    
    // Getter 메서드들 추가
    public String getApprovalLineId() {
        return approvalLineId;
    }
    
    public String getApproverId() {
        return approverId;
    }
    
    public Integer getStepOrder() {
        return stepOrder;
    }
    
    public String getStepType() {
        return stepType;
    }
    
    public String getDelegatedToId() {
        return delegatedToId;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public Boolean getIsRequired() {
        return isRequired;
    }
}

